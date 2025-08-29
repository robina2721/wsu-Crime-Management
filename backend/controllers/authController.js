import { findUserById, findUserByUsername } from "../../backend/models/userModel.js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function loginHandler(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 });
    }
    const user = await findUserByUsername(username);
    if (!user || !user.isActive) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    const pwd = user.password || "";
    const ok = pwd.startsWith("$2") ? await bcrypt.compare(password, pwd) : password === pwd;
    if (!ok) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    const token = `token_${user.id}_${Date.now()}`;
    const { password: _p, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword, token, message: "Login successful" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function profileHandler(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const userId = token.split("_")[1];
    const user = await findUserById(userId);
    if (!user) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    const { password: _p, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
