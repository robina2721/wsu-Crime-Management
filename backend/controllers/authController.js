import {
  findUserById,
  findUserByUsername,
  createUser,
  updateUser,
} from "../../backend/models/userModel.js";
import { createPendingAccount } from "../../backend/models/pendingAccountModel.js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { recordLoginAttempt, countRecentFailedAttempts, clearFailedAttemptsForUser } from "../../backend/models/securityModel.js";

function getRequestIp(req) {
  const fwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('x-client-ip');
  if (fwd) return fwd.split(',')[0].trim();
  // Not available: return null
  return null;
}

function getRequestCountry(req) {
  const c = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || req.headers.get('x-country') || req.headers.get('x-geo-country');
  if (c) return c;
  return null;
}

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
    const ip = getRequestIp(req);
    const country = getRequestCountry(req);

    if (!user) {
      // Record failed attempt for unknown user
      try { await recordLoginAttempt({ username, userId: null, ip, country, success: false, reason: 'user_not_found' }); } catch(e){}
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      // Record attempt
      try { await recordLoginAttempt({ username, userId: user.id, ip, country, success: false, reason: 'account_inactive' }); } catch(e){}
      return NextResponse.json(
        { success: false, message: "Account inactive" },
        { status: 403 },
      );
    }

    const pwd = user.password || "";
    const ok = pwd.startsWith("$2")
      ? await bcrypt.compare(password, pwd)
      : password === pwd;
    if (!ok) {
      // record failed
      try { await recordLoginAttempt({ username, userId: user.id, ip, country, success: false, reason: 'invalid_password' }); } catch(e){}
      // check threshold
      try {
        const count = await countRecentFailedAttempts({ userId: user.id, minutes: 60 });
        const threshold = 5;
        if (count >= threshold) {
          // deactivate account
          await updateUser(user.id, { isActive: false });
          // record lock event
          try { await recordLoginAttempt({ username, userId: user.id, ip, country, success: false, reason: 'account_locked' }); } catch(e){}
        }
      } catch (e) {}
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // success
    try { await recordLoginAttempt({ username, userId: user.id, ip, country, success: true, reason: 'login_success' }); } catch(e){}
    // optionally clear previous failures
    try { await clearFailedAttemptsForUser(user.id); } catch(e){}

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
