import {
  listCrimes,
  getCrime,
  createCrime,
  updateCrime,
  deleteCrime,
} from "../../backend/models/crimeModel.js";
import {
  createEvidenceForCrime,
  createWitnessesForCrime,
  getEvidenceByCrime,
  getWitnessesByCrime,
  addStatusUpdate,
  getStatusUpdatesByCrime,
  addCrimeMessage,
  getCrimeMessages,
} from "../../backend/models/crimeModel.js";
import { findUserById } from "../../backend/models/userModel.js";
import { notifyCrimeUpdate } from "../../backend/controllers/realtimeController.js";
import { NextResponse } from "next/server";

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

export async function listHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    let reportedBy = searchParams.get("reportedBy") || undefined;
    let assignedTo = searchParams.get("assignedTo") || undefined;
    if (reportedBy === "me" || assignedTo === "me") {
      const u = await getAuthUser(req);
      if (u) {
        if (reportedBy === "me") reportedBy = u.id;
        if (assignedTo === "me") assignedTo = u.id;
      }
    }
    const reports = await listCrimes(
      { status, category, priority, reportedBy, assignedTo },
      limit,
      offset,
    );
    return NextResponse.json({
      success: true,
      data: { reports, total: reports.length, limit, offset },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getHandler(_req, params) {
  try {
    const report = await getCrime(params.id);
    if (!report)
      return NextResponse.json(
        { success: false, error: "Crime report not found" },
        { status: 404 },
      );
    let evidence = report.evidence,
      witnesses = report.witnesses;
    try {
      if (!Array.isArray(evidence))
        evidence = await getEvidenceByCrime(report.id);
      if (!Array.isArray(witnesses))
        witnesses = await getWitnessesByCrime(report.id);
    } catch {}
    return NextResponse.json({
      success: true,
      data: { ...report, evidence, witnesses },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const allowed = new Set([
      "citizen",
      "preventive_officer",
      "detective_officer",
      "police_head",
      "super_admin",
    ]);
    if (!allowed.has(user.role))
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );

    const body = await req.json();
    const required = [
      "title",
      "description",
      "category",
      "location",
      "dateIncident",
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
      category: body.category,
      priority: body.priority || "medium",
      location: body.location,
      dateIncident: body.dateIncident,
      reportedBy: user.id,
    };
    const created = await createCrime(payload);
    // Optional: persist evidence and witnesses if provided
    if (Array.isArray(body.evidence) && body.evidence.length) {
      try {
        await createEvidenceForCrime(created.id, body.evidence, {
          uploadedBy: user.id,
        });
      } catch {}
    }
    if (Array.isArray(body.witnesses) && body.witnesses.length) {
      try {
        await createWitnessesForCrime(created.id, body.witnesses);
      } catch {}
    }
    let evidence = [],
      witnesses = [];
    try {
      [evidence, witnesses] = await Promise.all([
        getEvidenceByCrime(created.id),
        getWitnessesByCrime(created.id),
      ]);
    } catch {}
    const createdWithExtras = { ...created, evidence, witnesses };
    notifyCrimeUpdate(createdWithExtras);
    return NextResponse.json(
      {
        success: true,
        data: createdWithExtras,
        message: "Crime report created successfully",
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body = await req.json();

    // Load existing report
    const current = await getCrime(params.id);
    if (!current)
      return NextResponse.json(
        { success: false, error: "Crime report not found" },
        { status: 404 },
      );

    const isSupervisor = new Set([
      "detective_officer",
      "police_head",
      "super_admin",
    ]).has(user.role);

    // Assignment changes are restricted to supervisors (detective/head/admin)
    if (
      Object.prototype.hasOwnProperty.call(body, "assignedTo") &&
      !isSupervisor
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: insufficient permissions to assign",
        },
        { status: 403 },
      );
    }

    // Preventive officers can update status only if the case is assigned to them
    if (user.role === "preventive_officer") {
      if (current.assignedTo !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden: case not assigned to you" },
          { status: 403 },
        );
      }
      const allowedUpdates = {};
      if (Object.prototype.hasOwnProperty.call(body, "status"))
        allowedUpdates.status = body.status;
      if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json(
          { success: false, error: "No allowed fields to update" },
          { status: 400 },
        );
      }
      const updated = await updateCrime(params.id, allowedUpdates);
      try {
        if (Object.prototype.hasOwnProperty.call(body, "status")) {
          await addStatusUpdate(params.id, {
            status: body.status,
            notes: body.notes,
            updatedBy: user.id,
            isVisibleToCitizen: body.isVisibleToCitizen !== false,
          });
        }
      } catch {}
      notifyCrimeUpdate(updated);
      return NextResponse.json({
        success: true,
        data: updated,
        message: "Crime report updated successfully",
      });
    }

    // Supervisors: allow whitelisted fields (model enforces allowed set). Auto-set status to 'assigned' when assigning.
    const updates = { ...body };
    if (
      Object.prototype.hasOwnProperty.call(updates, "assignedTo") &&
      !Object.prototype.hasOwnProperty.call(updates, "status")
    ) {
      updates.status = "assigned";
    }
    const updated = await updateCrime(params.id, updates);
    notifyCrimeUpdate(updated);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Crime report updated successfully",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteHandler(_req, params) {
  try {
    const ok = await deleteCrime(params.id);
    if (!ok)
      return NextResponse.json(
        { success: false, error: "Crime report not found" },
        { status: 404 },
      );
    return NextResponse.json({
      success: true,
      message: "Crime report deleted successfully",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Status tracking handlers
export async function getStatusHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    const report = await getCrime(params.id);
    if (!report)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    let updates = await getStatusUpdatesByCrime(report.id);
    // Filter visibility for citizens
    if (user?.role === "citizen") {
      updates = updates.filter(
        (u) => u.isVisibleToCitizen === 1 || u.isVisibleToCitizen === true,
      );
    }
    const assignedOfficer = report.assignedTo
      ? await findUserById(report.assignedTo)
      : null;
    const payload = {
      reportId: report.id,
      currentStatus: report.status,
      statusHistory: updates.map((u) => ({
        status: u.status,
        timestamp: u.createdAt,
        updatedBy: u.updatedBy,
        notes: u.notes ?? undefined,
        isVisibleToCitizen: !!u.isVisibleToCitizen,
      })),
      assignedOfficer: assignedOfficer
        ? {
            id: assignedOfficer.id,
            name: assignedOfficer.fullName || assignedOfficer.username,
            badgeNumber: assignedOfficer.username,
            contactInfo:
              assignedOfficer.email || assignedOfficer.phone || undefined,
          }
        : undefined,
      lastUpdate: updates[0]?.createdAt || report.updatedAt,
      estimatedResolution: undefined,
      canProvideUpdates:
        !!user &&
        (user.role === "citizen" ? report.reportedBy === user.id : true),
    };
    return NextResponse.json({ success: true, data: payload });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function postStatusHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const report = await getCrime(params.id);
    if (!report)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );

    const body = await req.json();
    const isSupervisor = new Set([
      "detective_officer",
      "police_head",
      "super_admin",
    ]).has(user.role);
    if (user.role === "preventive_officer") {
      if (report.assignedTo !== user.id)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
    } else if (!isSupervisor) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const upd = await addStatusUpdate(report.id, {
      status: body.status || report.status,
      notes: body.notes,
      updatedBy: user.id,
      isVisibleToCitizen: body.isVisibleToCitizen !== false,
    });
    // also update main crime status if changed
    let updatedCrime = report;
    if (body.status && body.status !== report.status) {
      updatedCrime = await updateCrime(report.id, { status: body.status });
    }
    try {
      // notify reporter and assigned officer
      notifyStatusUpdate(report.id, upd, {
        reportedBy: updatedCrime.reportedBy,
        assignedTo: updatedCrime.assignedTo,
      });
    } catch {}
    return NextResponse.json({
      success: true,
      data: upd,
      message: "Status updated",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Messaging handlers
export async function listMessagesHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const report = await getCrime(params.id);
    if (!report)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    // Basic access control: reporter, assigned officer, or supervisors
    const isReporter = report.reportedBy === user.id;
    const isAssigned = report.assignedTo === user.id;
    const isSupervisor = new Set([
      "detective_officer",
      "police_head",
      "super_admin",
    ]).has(user.role);
    if (!(isReporter || isAssigned || isSupervisor))
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );

    const limit = 100,
      offset = 0;
    const messages = await getCrimeMessages(report.id, limit, offset);
    return NextResponse.json({
      success: true,
      data: { messages, total: messages.length, limit, offset },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createMessageHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const report = await getCrime(params.id);
    if (!report)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );

    // Basic access control
    const isReporter = report.reportedBy === user.id;
    const isAssigned = report.assignedTo === user.id;
    const isSupervisor = new Set([
      "detective_officer",
      "police_head",
      "super_admin",
    ]).has(user.role);
    if (!(isReporter || isAssigned || isSupervisor))
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );

    const body = await req.json();
    if (!body.message || typeof body.message !== "string")
      return NextResponse.json(
        { success: false, error: "Message required" },
        { status: 400 },
      );
    const msg = await addCrimeMessage(report.id, {
      senderId: user.id,
      senderRole: user.role,
      message: body.message,
    });
    try {
      notifyCrimeMessage(report.id, {
        ...msg,
        reportedBy: report.reportedBy,
        assignedTo: report.assignedTo,
        recipientId:
          user.id === report.reportedBy ? report.assignedTo : report.reportedBy,
      });
    } catch {}
    return NextResponse.json(
      { success: true, data: msg, message: "Message sent" },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
