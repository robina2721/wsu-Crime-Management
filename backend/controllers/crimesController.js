import { listCrimes, getCrime, createCrime, updateCrime, deleteCrime } from "../../backend/models/crimeModel.js";
import { NextResponse } from "next/server";

export async function listHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const reports = await listCrimes({ status, category, priority }, limit, offset);
    return NextResponse.json({ success: true, data: { reports, total: reports.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getHandler(_req, params) {
  try {
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: "Crime report not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createHandler(req) {
  try {
    const body = await req.json();
    const required = ["title", "description", "category", "location", "dateIncident", "reportedBy"];
    for (const k of required) if (!body[k]) return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    const created = await createCrime(body);
    return NextResponse.json({ success: true, data: created, message: "Crime report created successfully" }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateHandler(req, params) {
  try {
    const updates = await req.json();
    const updated = await updateCrime(params.id, updates);
    if (!updated) return NextResponse.json({ success: false, error: "Crime report not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: "Crime report updated successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function deleteHandler(_req, params) {
  try {
    const ok = await deleteCrime(params.id);
    if (!ok) return NextResponse.json({ success: false, error: "Crime report not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Crime report deleted successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
