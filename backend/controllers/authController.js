import {
  findUserById,
  findUserByUsername,
  createUser,
  updateUser,
} from "../../backend/models/userModel.js";
import { createPendingAccount } from "../../backend/models/pendingAccountModel.js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  recordLoginAttempt,
  countRecentFailedAttempts,
  clearFailedAttemptsForUser,
} from "../../backend/models/securityModel.js";

// ─── IP + Country Helpers ───────────────────────────────────────
function getRequestIp(req) {
  const fwd =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-client-ip");
  return fwd ? fwd.split(",")[0].trim() : null;
}

async function getRequestCountry(req, ip) {
  const headerCountry =
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country") ||
    req.headers.get("x-geo-country");

  if (headerCountry) return headerCountry;

  try {
    const lookupIp = ip || getRequestIp(req);
    // Dynamically import geoip-lite to avoid startup errors when its data files are missing
    try {
      const geoipMod = await import("geoip-lite");
      const geoip = geoipMod.default || geoipMod;
      if (!geoip || typeof geoip.lookup !== "function") return null;
      const info = geoip.lookup(lookupIp);
      return info?.country || null;
    } catch (e) {
      console.warn(
        "[auth] geoip lookup unavailable or failed:",
        e && e.message ? e.message : String(e),
      );
      return null;
    }
  } catch {
    return null;
  }
}

// ─── Login Handler ──────────────────────────────────────────────
export async function loginHandler(req) {
  try {
    console.debug("[auth] loginHandler called", {
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    });
    const body = await req.json();
    console.debug("[auth] login payload", { body });
    const username = body.username;
    const password = body.password;
    const selectedRole = (
      body.role ||
      body.selectedRole ||
      body.requestedRole ||
      ""
    )
      .toString()
      .toLowerCase();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 },
      );
    }

    let user = null;
    const ip = getRequestIp(req);
    const country = await getRequestCountry(req, ip);

    try {
      user = await findUserByUsername(username);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== "production") {
        const devUsers = {
          admin: {
            id: "1",
            username: "admin",
            password: "admin123",
            role: "super_admin",
            fullName: "System Admin",
            email: "admin@example.com",
            isActive: 1,
          },
          // Add other dev users here...
        };
        user = devUsers[username];
        if (!user) console.error("DB error and no fallback user:", dbErr);
      } else {
        throw dbErr;
      }
    }

    if (!user) {
      console.log("Login failure reason: user not found");
      try {
        const attemptedPasswordHash = await bcrypt.hash(password, 10);
        const attemptedPasswordMasked = `len:${String(password || "").length}`;
        await recordLoginAttempt({
          username,
          userId: null,
          ip,
          country,
          success: false,
          reason: "user_not_found",
          attemptedPasswordHash,
          attemptedPasswordMasked,
        });
      } catch (e) {
        console.warn(
          "[auth] recordLoginAttempt failed (user_not_found)",
          e && e.message ? e.message : String(e),
        );
      }
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      console.log("Login failure reason: account inactive");
      try {
        const attemptedPasswordHash = await bcrypt.hash(password, 10);
        const attemptedPasswordMasked = `len:${String(password || "").length}`;
        await recordLoginAttempt({
          username,
          userId: user.id,
          ip,
          country,
          success: false,
          reason: "account_inactive",
          attemptedPasswordHash,
          attemptedPasswordMasked,
        });
      } catch (e) {
        console.warn(
          "[auth] recordLoginAttempt failed (account_inactive)",
          e && e.message ? e.message : String(e),
        );
      }
      return NextResponse.json(
        { success: false, message: "Account inactive" },
        { status: 403 },
      );
    }

    if (selectedRole && selectedRole !== (user.role || "").toLowerCase()) {
      console.warn(
        "Role mismatch on login; allowing login but noting mismatch",
        {
          selectedRole,
          userRole: (user.role || "").toLowerCase(),
        },
      );
      try {
        await recordLoginAttempt({
          username,
          userId: user.id,
          ip,
          country,
          success: true,
          reason: "role_mismatch_allowed",
        });
      } catch {}
      // Do not block login due to role mismatch; proceed to password validation
    }

    const pwd = user.password || "";
    const validPassword = pwd.startsWith("$2")
      ? await bcrypt.compare(password, pwd)
      : password === pwd;

    if (!validPassword) {
      console.log("Login failure reason: invalid password");
      try {
        const attemptedPasswordHash = await bcrypt.hash(password, 10);
        const attemptedPasswordMasked = `len:${String(password || "").length}`;
        await recordLoginAttempt({
          username,
          userId: user.id,
          ip,
          country,
          success: false,
          reason: "invalid_password",
          attemptedPasswordHash,
          attemptedPasswordMasked,
        });
      } catch (e) {
        console.warn(
          "[auth] recordLoginAttempt failed (invalid_password)",
          e && e.message ? e.message : String(e),
        );
      }

      try {
        const count = await countRecentFailedAttempts({
          userId: user.id,
          minutes: 60,
        });
        const threshold = 5;
        if (count >= threshold) {
          await updateUser(user.id, { isActive: false });
          try {
            const attemptedPasswordHash = await bcrypt.hash(password, 10);
            const attemptedPasswordMasked = `len:${String(password || "").length}`;
            await recordLoginAttempt({
              username,
              userId: user.id,
              ip,
              country,
              success: false,
              reason: "account_locked",
              attemptedPasswordHash,
              attemptedPasswordMasked,
            });
          } catch (e) {
            console.warn(
              "[auth] recordLoginAttempt failed (account_locked)",
              e && e.message ? e.message : String(e),
            );
          }
        }
      } catch (e) {
        console.warn(
          "[auth] countRecentFailedAttempts/updateUser failed",
          e && e.message ? e.message : String(e),
        );
      }
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    try {
      await recordLoginAttempt({
        username,
        userId: user.id,
        ip,
        country,
        success: true,
        reason: "login_success",
      });
    } catch (e) {
      console.warn(
        "[auth] recordLoginAttempt failed (login_success)",
        e && e.message ? e.message : String(e),
      );
    }

    try {
      await clearFailedAttemptsForUser(user.id);
    } catch (e) {
      console.warn(
        "[auth] clearFailedAttemptsForUser failed",
        e && e.message ? e.message : String(e),
      );
    }

    const token = `token_${user.id}_${Date.now()}`;
    const { password: _p, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: "Login successful",
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, message: msg, details },
      { status },
    );
  }
}

export async function signupCitizenHandler(req) {
  console.log("🔥 signup endpoint hit");

  try {
    const body = await req.json();
    console.log("📦 Signup payload:", body);

    const {
      username,
      password,
      fullName,
      email,
      phone,
      requestedRole,
      photo,
      photoMime,
      photoBase64,
      details,
    } = body; // ✅ Use `body`, don't call req.json() again

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
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 409 },
      );
    }

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
    // Non-citizen: requires photo & details
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
    console.error("❌ Signup error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, message: msg, details },
      { status },
    );
  }
}

// ─── Profile Handler ────────────────────────────────────────────
export async function profileHandler(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = token.split("_")[1];
    const user = await findUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const { password: _p, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    const details =
      process.env.NODE_ENV !== "production"
        ? { stack: err instanceof Error ? err.stack : undefined }
        : undefined;
    return NextResponse.json(
      { success: false, message: msg, details },
      { status },
    );
  }
}
