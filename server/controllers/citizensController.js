import { NextResponse } from "next/server";
import { createUser, listUsers } from "../models/userModel.js";

export async function createCitizenHandler(req) {
  const body = await req.json();
  if (!body.username || !body.fullName) {
    return NextResponse.json({ success: false, error: "username and fullName are required" }, { status: 400 });
  }
  body.role = "citizen";
  const created = await createUser(body);
  return NextResponse.json({ success: true, data: created, message: "Citizen created" }, { status: 201 });
}

export async function listCitizensHandler(req) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const users = await listUsers(limit, offset, { role: "citizen" });
  return NextResponse.json({ success: true, data: { citizens: users, total: users.length, limit, offset } });
}
