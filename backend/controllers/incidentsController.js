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
    const rows = await listIncidents(limit, offset, {
      status,
      incidentType,
      severity,
      reportedBy,
    });
    return NextResponse.json({
      success: true,
      data: { incidents: rows, total: rows.length, limit, offset },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
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
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
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
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const body = await req.json();
    const required = [
      "title",
      "description",
      "incidentType",
      "location",
      "dateOccurred",
    ];
    for (const k of required)
      if (!body[k])
        return NextResponse.json(
          { success: false, error: `Missing required field: ${k}` },
          { status: 400 },
        );
    const payload = {
      title: body.title,
      description: body.description,
      incidentType: body.incidentType,
      severity: body.severity || "low",
      location: body.location,
      dateOccurred: body.dateOccurred,
      reportedBy: user.id,
      reporterName: user.fullName || user.username,
      status: "reported",
      followUpRequired: !!body.followUpRequired,
      relatedCaseId: body.relatedCaseId || null,
    };
    const created = await createIncident(payload);
    try { notifyIncidentUpdate({ type: "created", incident: created }); } catch {}
    return NextResponse.json(
      { success: true, data: created, message: "Incident created" },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateIncidentHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!allow(["detective_officer", "police_head", "super_admin"], user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const updates = await req.json();
    const updated = await updateIncident(params.id, updates);
    if (!updated)
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 },
      );
    try { notifyIncidentUpdate({ type: "updated", incident: updated }); } catch {}
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Incident updated",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteIncidentHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!allow(["police_head", "super_admin"], user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    await deleteIncident(params.id);
    try { notifyIncidentUpdate({ type: "deleted", id: params.id }); } catch {}
    return NextResponse.json({ success: true, message: "Incident deleted" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
