import { NextRequest, NextResponse } from "next/server";
import { findUserById, findUserByUsername } from "../models/userModel";
import bcrypt from "bcryptjs";

export async function loginHandler(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 });
  }
  const user = await findUserByUsername(username);
  if (!user || !user.isActive) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }
  const pwd = user.password || "";
  let ok = false;
  if (pwd.startsWith("$2")) ok = await bcrypt.compare(password, pwd);
  else ok = password === pwd;
  if (!ok) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  const token = `token_${user.id}_${Date.now()}`;
  const { password: _p, ...userWithoutPassword } = user as any;
  return NextResponse.json({ success: true, user: userWithoutPassword, token, message: "Login successful" });
}

export async function profileHandler(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("_")[1];
  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  const { password: _p, ...userWithoutPassword } = user as any;
  return NextResponse.json({ success: true, user: userWithoutPassword });
}
