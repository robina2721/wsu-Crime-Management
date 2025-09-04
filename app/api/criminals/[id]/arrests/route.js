import { NextResponse } from "next/server";
import { findUserById } from "../../../../../backend/models/userModel.js";
import { listArrests, createArrest } from "../../../../../backend/models/criminalHistoryModel.js";

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

function requireAdmin(user) {
  return !!(user && (user.role === "super_admin" || user.role === "police_head"));
}

export async function GET(_req, { params }) {
  try {
    const items = await listArrests(params.id);
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!requireAdmin(user))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    await createArrest(params.id, body);
    const items = await listArrests(params.id);
    return NextResponse.json({ success: true, data: items, message: "Arrest added" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
