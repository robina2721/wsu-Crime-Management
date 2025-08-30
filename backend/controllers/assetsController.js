import { NextResponse } from "next/server";
import { listAssets, getAsset, createAsset, updateAsset, deleteAsset } from "../../backend/models/assetModel.js";
import { findUserById } from "../../backend/models/userModel.js";

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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const assets = await listAssets(limit, offset);
    return NextResponse.json({ success: true, data: { assets, total: assets.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getHandler(_req, params) {
  try {
    const asset = await getAsset(params.id);
    if (!asset) return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: asset });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const allowed = new Set(["police_head", "super_admin"]);
    if (!allowed.has(user.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.name || !body.category || !body.type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const payload = {
      name: body.name,
      category: body.category,
      type: body.type,
      description: body.description,
      serialNumber: body.serialNumber,
      purchaseDate: body.purchaseDate,
      currentValue: body.currentValue,
      status: body.status,
      condition: body.condition,
      location: body.location,
      assignedTo: body.assignedTo,
      assignedToName: body.assignedToName,
      nextMaintenance: body.nextMaintenance,
    };
    const created = await createAsset(payload);
    return NextResponse.json({ success: true, data: created, message: "Asset created" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const updated = await updateAsset(params.id, body);
    return NextResponse.json({ success: true, data: updated, message: "Asset updated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteHandler(_req, params) {
  try {
    await deleteAsset(params.id);
    return NextResponse.json({ success: true, message: "Asset deleted" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
