import { NextResponse } from "next/server";
import {
  listPendingAccounts,
  createPendingAccount,
  approvePendingAccount,
  rejectPendingAccount,
  findPendingById,
} from "../../backend/models/pendingAccountModel.js";
import { findUserById } from "../../backend/models/userModel.js";

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

export async function listPendingHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager", "police_head"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const requestedRole = searchParams.get("requestedRole") || undefined;
    const rows = await listPendingAccounts(limit, offset, {
      status,
      requestedRole,
    });
    return NextResponse.json({
      success: true,
      data: { pending: rows, total: rows.length, limit, offset },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function requestAccountHandler(req) {
  try {
    const body = await req.json();
    const required = ["fullName", "username", "requestedRole"];
    for (const k of required)
      if (!body[k])
        return NextResponse.json(
          { success: false, error: `Missing required field: ${k}` },
          { status: 400 },
        );
    const created = await createPendingAccount({
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      phone: body.phone,
      requestedRole: body.requestedRole,
      documents: body.documents ? JSON.stringify(body.documents) : null,
      notes: body.notes || null,
    });
    return NextResponse.json(
      { success: true, data: created, message: "Account request submitted" },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function approvePendingHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager", "police_head"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const pending = await findPendingById(params.id);
    if (!pending)
      return NextResponse.json(
        { success: false, error: "Pending account not found" },
        { status: 404 },
      );
    const body = await req.json().catch(() => ({}));
    const res = await approvePendingAccount(params.id, body || {});
    return NextResponse.json({
      success: true,
      data: res,
      message: "Pending account approved",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function rejectPendingHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager", "police_head"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || null;
    const updated = await rejectPendingAccount(params.id, reason);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Pending account rejected",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
