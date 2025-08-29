import { NextResponse } from "next/server";
import { listUsers, createUser, updateUser, deleteUser, findUserById } from "../models/userModel.js";

export async function listUsersHandler(req) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const role = searchParams.get("role") || undefined;
  const isActiveParam = searchParams.get("isActive");
  const isActive = isActiveParam === null ? undefined : isActiveParam === "true";
  const users = await listUsers(limit, offset, { role, isActive });
  return NextResponse.json({ success: true, data: { users, total: users.length, limit, offset } });
}

export async function createUserHandler(req) {
  const body = await req.json();
  const required = ["username", "fullName", "role"];
  for (const k of required) if (!body[k]) return NextResponse.json({ success: false, error: `Missing required field: ${k}` }, { status: 400 });
  const created = await createUser(body);
  return NextResponse.json({ success: true, data: created, message: "User created" }, { status: 201 });
}

export async function getUserHandler(_req, params) {
  const user = await findUserById(params.id);
  if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function updateUserHandler(req, params) {
  const updates = await req.json();
  const updated = await updateUser(params.id, updates);
  if (!updated) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated, message: "User updated" });
}

export async function deleteUserHandler(_req, params) {
  await deleteUser(params.id);
  return NextResponse.json({ success: true, message: "User deleted" });
}
