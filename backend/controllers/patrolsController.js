import { NextResponse } from "next/server";
import { findUserById } from "../../backend/models/userModel.js";
import { listPatrols, getPatrol, createPatrol, endPatrol, addPatrolActivity } from "../../backend/models/patrolModel.js";

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

function canViewAll(user) {
  return !!(user && new Set(["super_admin","police_head"]).has(user.role));
}
function canCreate(user) {
  return !!(user && new Set(["preventive_officer","police_head","super_admin"]).has(user.role));
}

export async function listPatrolsHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const officerFilter = canViewAll(user) ? undefined : user.id;
    const rows = await listPatrols(limit, offset, { officerId: officerFilter });
    // Attach activities for each patrol (optional heavy); keep lightweight here
    return NextResponse.json({ success: true, data: { patrols: rows, total: rows.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getPatrolHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const log = await getPatrol(params.id);
    if (!log) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (!canViewAll(user) && log.officerId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: log });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createPatrolHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!canCreate(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (!body.route || !body.area || !body.shift) return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    const created = await createPatrol({
      officerId: user.id,
      officerName: user.fullName || user.username,
      shift: body.shift,
      startTime: new Date(),
      route: body.route,
      area: body.area,
      notes: body.notes || null,
      mileageStart: body.mileageStart ?? null,
      vehicleId: body.vehicleId || null,
      initialActivity: { activity: 'Patrol started', location: 'Police Station', type: 'patrol' }
    });
    return NextResponse.json({ success: true, data: created, message: "Patrol started" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function endPatrolHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const log = await getPatrol(params.id);
    if (!log) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (!canViewAll(user) && log.officerId !== user.id) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const updated = await endPatrol(params.id, { mileageEnd: typeof body.mileageEnd === 'number' ? body.mileageEnd : null });
    return NextResponse.json({ success: true, data: updated, message: "Patrol ended" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function addActivityHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const log = await getPatrol(params.id);
    if (!log) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (!canViewAll(user) && log.officerId !== user.id) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (!body.activity || !body.location || !body.type) return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    const created = await addPatrolActivity(params.id, {
      time: new Date(),
      activity: body.activity,
      location: body.location,
      description: body.description || null,
      type: body.type,
    });
    return NextResponse.json({ success: true, data: created, message: "Activity added" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
