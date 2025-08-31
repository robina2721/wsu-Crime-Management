import { NextResponse } from "next/server";
import { findUserById } from "../../backend/models/userModel.js";
import {
  listFeedback,
  getFeedback,
  createFeedback,
  respondFeedback,
} from "../../backend/models/feedbackModel.js";

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

export async function listHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const items = await listFeedback(limit, offset, { type, status, category });
    return NextResponse.json({
      success: true,
      data: { feedback: items, total: items.length, limit, offset },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status: code });
  }
}

export async function createHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const body = await req.json();
    const required = ["subject", "message", "feedbackType", "category"];
    for (const k of required)
      if (!body[k])
        return NextResponse.json(
          { success: false, error: `Missing required field: ${k}` },
          { status: 400 },
        );
    const payload = {
      citizenId: user.id,
      citizenName: body.isAnonymous
        ? "Anonymous"
        : user.fullName || user.username,
      email: body.isAnonymous ? null : body.email || user.email || null,
      phone: body.isAnonymous ? null : body.phone || user.phone || null,
      feedbackType: body.feedbackType,
      category: body.category,
      subject: body.subject,
      message: body.message,
      relatedCaseId: body.relatedCaseId || null,
      priority: body.priority || "medium",
      isAnonymous: !!body.isAnonymous,
    };
    const created = await createFeedback(payload);
    return NextResponse.json(
      { success: true, data: created, message: "Feedback submitted" },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status: code });
  }
}

export async function respondHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const admin = new Set(["super_admin", "police_head", "hr_manager"]).has(
      user.role,
    );
    if (!admin)
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    const body = await req.json();
    if (!body.response)
      return NextResponse.json(
        { success: false, error: "Response required" },
        { status: 400 },
      );
    const updated = await respondFeedback(params.id, {
      response: body.response,
      status: body.status,
      respondedById: user.id,
      respondedByName: user.fullName || user.username,
    });
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Response recorded",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status: code });
  }
}
