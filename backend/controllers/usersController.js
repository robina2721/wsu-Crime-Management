import { NextResponse } from "next/server";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  findUserById,
} from "../../backend/models/userModel.js";
import {
  saveUserPhoto,
  getLatestUserPhoto,
} from "../../backend/models/userPhotoModel.js";
import { NextResponse } from "next/server";

function getAuthUserId(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 2 ? parts[1] : null;
}

async function getAuthUser(req) {
  const id = getAuthUserId(req);
  if (!id) return null;
  return await findUserById(id);
}

function requireRoles(user, roles) {
  return !!(user && roles.includes(user.role));
}

export async function listUsersHandler(req) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const withCaseCounts = searchParams.get("withCaseCounts") === "true";
    const allowed = withCaseCounts
      ? ["super_admin", "police_head", "detective_officer"]
      : ["super_admin", "hr_manager", "police_head"];
    if (!requireRoles(user, allowed)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    if (withCaseCounts) {
      const officers = await (
        await import("../../backend/models/userModel.js")
      ).listActiveOfficersWithCaseCounts(limit, offset);
      return NextResponse.json({
        success: true,
        data: { users: officers, total: officers.length, limit, offset },
      });
    }
    const role = searchParams.get("role") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive =
      isActiveParam === null ? undefined : isActiveParam === "true";
    const users = await listUsers(limit, offset, { role, isActive });
    return NextResponse.json({
      success: true,
      data: { users, total: users.length, limit, offset },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createUserHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const body = await req.json();
    const required = ["username", "fullName", "role"];
    for (const k of required)
      if (!body[k])
        return NextResponse.json(
          { success: false, error: `Missing required field: ${k}` },
          { status: 400 },
        );
    const created = await createUser(body);
    return NextResponse.json(
      { success: true, data: created, message: "User created" },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getUserHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager", "police_head"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const target = await findUserById(params.id);
    if (!target)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: target });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateUserHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const updates = await req.json();
    const updated = await updateUser(params.id, updates);
    if (!updated)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    return NextResponse.json({
      success: true,
      data: updated,
      message: "User updated",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteUserHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    await deleteUser(params.id);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function uploadUserPhotoHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string")
      return NextResponse.json(
        { success: false, error: "No file" },
        { status: 400 },
      );
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const saved = await saveUserPhoto(
      params.id,
      file.type || "image/jpeg",
      base64,
    );
    const photoUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json(
      { success: true, data: { ...saved, photoUrl } },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getUserPhotoHandler(req, params) {
  try {
    const viewer = await getAuthUser(req);
    if (!viewer)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const latest = await getLatestUserPhoto(params.id);
    if (!latest) return NextResponse.json({ success: true, data: null });
    const photoUrl = `data:${latest.mime};base64,${latest.dataBase64}`;
    return NextResponse.json({
      success: true,
      data: { photoUrl, createdAt: latest.createdAt },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
