import { NextResponse } from "next/server";
import { findUserById, updateUser } from "../../backend/models/userModel.js";
import { listAudit, clearFailedAttemptsForUser } from "../../backend/models/securityModel.js";
import { findUserByUsername } from "../../backend/models/userModel.js";

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

function isAdmin(user) {
  return !!(user && user.role === "super_admin");
}

export async function listAuditHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user) && user.role !== 'police_head') return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const username = searchParams.get("username") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const successParam = searchParams.get("success");
    const success = successParam === null || successParam === undefined ? undefined : successParam === 'true';
    const rows = await listAudit(limit, offset, { username, userId, success });
    return NextResponse.json({ success: true, data: { audit: rows, total: rows.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function reactivateUserHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const target = await findUserById(params.id);
    if (!target) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    // Reactivate user
    await updateUser(params.id, { isActive: true });
    // Clear failed attempts
    await clearFailedAttemptsForUser(params.id);
    return NextResponse.json({ success: true, message: "User reactivated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
