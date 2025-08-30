import { NextResponse } from "next/server";
import { listCriminals, getCriminal, createCriminal, updateCriminal, deleteCriminal } from "../../backend/models/criminalModel.js";
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

export async function listHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const criminals = await listCriminals(limit, offset);
    return NextResponse.json({ success: true, data: { criminals, total: criminals.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getHandler(_req, params) {
  try {
    const rec = await getCriminal(params.id);
    if (!rec) return NextResponse.json({ success: false, error: "Criminal record not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createFromParsed(user, payload) {
  const created = await createCriminal(payload);
  return NextResponse.json({ success: true, data: created, message: "Criminal record created" }, { status: 201 });
}

export async function updateHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const updated = await updateCriminal(params.id, body);
    return NextResponse.json({ success: true, data: updated, message: "Criminal record updated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteHandler(_req, params) {
  try {
    await deleteCriminal(params.id);
    return NextResponse.json({ success: true, message: "Criminal record deleted" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function requireAdmin(req) {
  const user = await getAuthUser(req);
  if (!user) return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  const allowed = new Set(["super_admin"]);
  if (!allowed.has(user.role)) return { error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) };
  return { user };
}
