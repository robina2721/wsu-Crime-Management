import { NextResponse } from "next/server";
import { listUsers, createUser, updateUser, deleteUser, findUserById } from "../../backend/models/userModel.js";

export async function listUsersHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const role = searchParams.get("role") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam === null ? undefined : isActiveParam === "true";
    const users = await listUsers(limit, offset, { role, isActive });
    return NextResponse.json({ success: true, data: { users, total: users.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createUserHandler(req) {
  try {
    const body = await req.json();
    const required = ["username", "fullName", "role"];
    for (const k of required) if (!body[k]) return NextResponse.json({ success: false, error: `Missing required field: ${k}` }, { status: 400 });
    const created = await createUser(body);
    return NextResponse.json({ success: true, data: created, message: "User created" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getUserHandler(_req, params) {
  try {
    const user = await findUserById(params.id);
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateUserHandler(req, params) {
  try {
    const updates = await req.json();
    const updated = await updateUser(params.id, updates);
    if (!updated) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: "User updated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteUserHandler(_req, params) {
  try {
    await deleteUser(params.id);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
