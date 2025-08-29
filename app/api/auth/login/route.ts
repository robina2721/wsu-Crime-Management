import { NextRequest, NextResponse } from "next/server";
import { LoginRequest, LoginResponse, User } from "@shared/types";
import { users } from "@shared/mock/users";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginRequest;
    const { username, password } = body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        message: "Username and password are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = users.find((u) => u.username === username && u.isActive);
    if (!user || user.password !== password) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid credentials",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const token = `token_${user.id}_${Date.now()}`;
    const { password: _pwd, ...userWithoutPassword } = user as User & { password: string };

    const response: LoginResponse = {
      success: true,
      user: userWithoutPassword as User,
      token,
      message: "Login successful",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: LoginResponse = {
      success: false,
      message: "Internal server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
