import { NextResponse } from "next/server";
import { findUserById } from "../../backend/models/userModel.js";
import { listAssignments, createAssignment, updateAssignment, deleteAssignment } from "../../backend/models/assignmentModel.js";

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

function canView(user) {
  return !!(user && new Set(["super_admin","police_head","hr_manager"]).has(user.role));
}
function canManage(user) {
  return !!(user && new Set(["super_admin","police_head"]).has(user.role));
}

export async function listHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!canView(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const items = await listAssignments(limit, offset);
    return NextResponse.json({ success: true, data: { assignments: items, total: items.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!canManage(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (!body.officerId || !body.assignment) return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    const created = await createAssignment(body);
    return NextResponse.json({ success: true, data: created, message: "Assignment created" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!canManage(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const updates = await req.json();
    const updated = await updateAssignment(params.id, updates);
    return NextResponse.json({ success: true, data: updated, message: "Assignment updated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!canManage(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await deleteAssignment(params.id);
    return NextResponse.json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
