import { NextResponse } from "next/server";
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
} from "../../backend/models/incidentModel.js";
import { findUserById } from "../../backend/models/userModel.js";
import { notifyIncidentUpdate } from "../../backend/controllers/realtimeController.js";

function getAuthUserId(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 2 ? parts[1] : null;
}

async function getAuthUser(req) {
  const id = getAuthUserId(req);
  if (!id) return null;
  return await findUserById(id);
}

function allow(roles, user) {
  return !!(user && roles.includes(user.role));
}

export async function listIncidentsHandler(req) {
  console.debug("[incidents] listIncidentsHandler called", {
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const incidentType = searchParams.get("incidentType") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const reportedByParam = searchParams.get("reportedBy") || undefined;
    let reportedBy = undefined;
    if (reportedByParam) {
      if (reportedByParam === "me") {
        const uid = getAuthUserId(req);
        if (uid) reportedBy = uid;
      } else {
        reportedBy = reportedByParam;
      }
    }
    console.debug("[incidents] query params", {
      limit,
      offset,
      status,
      incidentType,
      severity,
      reportedBy,
    });
    const rows = await listIncidents(limit, offset, {
      status,
      incidentType,
      severity,
      reportedBy,
    });
    console.debug(`[incidents] fetched ${rows?.length ?? 0} rows`);
    return NextResponse.json({
      success: true,
      data: { incidents: rows, total: rows.length, limit, offset },
    });
  } catch (err) {
    console.error("[incidents] listIncidentsHandler error", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, error: msg, details },
      { status },
    );
  }
}

export async function getIncidentHandler(_req, params) {
  try {
    const it = await getIncident(params.id);
    if (!it)
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: it });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createIncidentHandler(req) {
  console.debug("[incidents] createIncidentHandler called", {
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });
  try {
    const user = await getAuthUser(req);
    let body = {};
    try {
      body = await req.json();
    } catch (pErr) {
      console.warn("[incidents] failed to parse JSON body", pErr);
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    console.debug("[incidents] request body", body, {
      user: user
        ? { id: user.id, username: user.username, role: user.role }
        : null,
    });

    const required = [
      "title",
      "description",
      "incidentType",
      "location",
      "dateOccurred",
    ];
    for (const k of required) {
      if (!body[k])
        return NextResponse.json(
          { success: false, error: `Missing required field: ${k}` },
          { status: 400 },
        );
    }

    // If authenticated, ensure role allows incident creation. Anonymous users can file non-crime incidents.
    if (user) {
      if (
        !allow(
          [
            "citizen",
            "preventive_officer",
            "detective_officer",
            "police_head",
            "super_admin",
          ],
          user,
        )
      ) {
        console.warn("[incidents] user forbidden from creating incident", {
          user: { id: user.id, role: user.role },
        });
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const payload = {
      title: body.title,
      description: body.description,
      incidentType: body.incidentType,
      severity: body.severity || "low",
      location: body.location,
      dateOccurred: body.dateOccurred,
      reportedBy: user ? user.id : null,
      reporterName: user
        ? user.fullName || user.username
        : body.reporterName || "Anonymous",
      status: "reported",
      followUpRequired: !!body.followUpRequired,
      relatedCaseId: body.relatedCaseId || null,
    };

    console.debug("[incidents] creating incident with payload", payload);
    const created = await createIncident(payload);
    console.debug("[incidents] incident created", created);
    try {
      notifyIncidentUpdate({ type: "created", incident: created });
    } catch (notifyErr) {
      console.warn("[incidents] notifyIncidentUpdate failed", notifyErr);
    }
    return NextResponse.json(
      { success: true, data: created, message: "Incident created" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[incidents] createIncidentHandler error", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, error: msg, details },
      { status },
    );
  }
}

export async function updateIncidentHandler(req, params) {
  console.debug("[incidents] updateIncidentHandler called", {
    id: params?.id,
    headers: Object.fromEntries(req.headers.entries()),
  });
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!allow(["detective_officer", "police_head", "super_admin"], user)) {
      console.warn("[incidents] user not allowed to update incident", {
        user: { id: user.id, role: user.role },
      });
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    let updates = {};
    try {
      updates = await req.json();
    } catch (pErr) {
      console.warn("[incidents] failed to parse JSON updates", pErr);
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }
    console.debug("[incidents] updates payload", updates);
    const updated = await updateIncident(params.id, updates);
    if (!updated)
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 },
      );
    try {
      notifyIncidentUpdate({ type: "updated", incident: updated });
    } catch (notifyErr) {
      console.warn("[incidents] notifyIncidentUpdate failed", notifyErr);
    }
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Incident updated",
    });
  } catch (err) {
    console.error("[incidents] updateIncidentHandler error", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, error: msg, details },
      { status },
    );
  }
}

export async function deleteIncidentHandler(req, params) {
  console.debug("[incidents] deleteIncidentHandler called", {
    id: params?.id,
    headers: Object.fromEntries(req.headers.entries()),
  });
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!allow(["police_head", "super_admin"], user)) {
      console.warn("[incidents] user not allowed to delete incident", {
        user: { id: user.id, role: user.role },
      });
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    console.debug("[incidents] deleting incident", { id: params.id });
    await deleteIncident(params.id);
    try {
      notifyIncidentUpdate({ type: "deleted", id: params.id });
    } catch (notifyErr) {
      console.warn("[incidents] notifyIncidentUpdate failed", notifyErr);
    }
    return NextResponse.json({ success: true, message: "Incident deleted" });
  } catch (err) {
    console.error("[incidents] deleteIncidentHandler error", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, error: msg, details },
      { status },
    );
  }
}
