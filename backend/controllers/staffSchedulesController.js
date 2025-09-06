import { NextResponse } from "next/server";
import { listStaffSchedules, createStaffSchedule, findStaffScheduleById, updateStaffSchedule, deleteStaffSchedule } from "../models/staffScheduleModel.js";
import { findUserById } from "../models/userModel.js";

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

function requireRoles(user, roles) {
  return !!(user && roles.includes(user.role));
}

export async function listStaffSchedulesHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager", "police_head"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const officerId = searchParams.get("officerId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const schedules = await listStaffSchedules(limit, offset, { officerId, startDate, endDate });
    return NextResponse.json({ success: true, data: { schedules, total: schedules.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createStaffScheduleHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.officerId || !body.startDate || !body.endDate) return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    body.createdBy = user?.id;
    const created = await createStaffSchedule(body);
    return NextResponse.json({ success: true, data: created, message: 'Schedule created' }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getStaffScheduleHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager", "police_head"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const schedule = await findStaffScheduleById(params.id);
    if (!schedule) return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: schedule });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateStaffScheduleHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const updates = await req.json();
    const updated = await updateStaffSchedule(params.id, updates);
    if (!updated) return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Schedule updated' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteStaffScheduleHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    await deleteStaffSchedule(params.id);
    return NextResponse.json({ success: true, message: 'Schedule deleted' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
