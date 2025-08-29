import { NextRequest, NextResponse } from "next/server";
import { users } from "@shared/mock/users";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("_")[1];
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }
  const { password: _pwd, ...userWithoutPassword } = user;
  return NextResponse.json({ success: true, user: userWithoutPassword });
}
