import {
  findUserById,
  findUserByUsername,
  createUser,
} from "../../backend/models/userModel.js";
import { createPendingAccount } from "../../backend/models/pendingAccountModel.js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function loginHandler(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 },
      );
    }
    const user = await findUserByUsername(username);
    if (!user || !user.isActive)
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    const pwd = user.password || "";
    const ok = pwd.startsWith("$2")
      ? await bcrypt.compare(password, pwd)
      : password === pwd;
    if (!ok)
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    const token = `token_${user.id}_${Date.now()}`;
    const { password: _p, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: "Login successful",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function signupCitizenHandler(req) {
  try {
    const { username, password, fullName, email, phone, requestedRole, photo, photoMime, photoBase64, details } =
      await req.json();
    if (!username || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "username, password and fullName are required",
        },
        { status: 400 },
      );
    }
    const existing = await findUserByUsername(username);
    if (existing)
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 409 },
      );
    const role = (requestedRole || "citizen").toLowerCase();

    if (role === "citizen") {
      const hashed = password.startsWith("$2")
        ? password
        : await bcrypt.hash(password, 10);
      const created = await createUser({
        username,
        password: hashed,
        role: "citizen",
        fullName,
        email,
        phone,
        isActive: true,
      });
      const token = `token_${created.id}_${Date.now()}`;
      const { password: _p, ...userWithoutPassword } = created;
      return NextResponse.json(
        {
          success: true,
          user: userWithoutPassword,
          token,
          message: "Signup successful",
        },
        { status: 201 },
      );
    }

    // For non-citizen roles, require photo and additional details and store password hash + photo in pending documents
    let mime = photoMime || null;
    let base64 = photoBase64 || null;
    if (!mime || !base64) {
      if (typeof photo === "string" && photo.startsWith("data:")) {
        const [meta, data] = photo.split(",");
        const m = /data:([^;]+);base64/.exec(meta || "");
        if (m) mime = m[1];
        base64 = data || null;
      }
    }

    if (!mime || !base64) {
      return NextResponse.json(
        { success: false, message: "Employee signup requires a photo" },
        { status: 400 },
      );
    }

    const passwordHash = password.startsWith("$2")
      ? password
      : await bcrypt.hash(password, 10);

    const documents = {
      passwordHash,
      photo: { mime, dataBase64: base64 },
      details: details && typeof details === "object" ? details : {},
    };

    const pending = await createPendingAccount({
      fullName,
      username,
      email,
      phone,
      requestedRole: role,
      status: "pending",
      documents: JSON.stringify(documents),
      notes: "Self registration via signup",
    });
    return NextResponse.json(
      {
        success: true,
        data: pending,
        message: "Account request submitted for approval",
      },
      { status: 202 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function profileHandler(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 },
      );
    const token = authHeader.replace("Bearer ", "");
    const userId = token.split("_")[1];
    const user = await findUserById(userId);
    if (!user)
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    const { password: _p, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
