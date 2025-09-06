import { NextResponse } from "next/server";
import { listHRReports, createHRReport, findHRReportById, updateHRReport } from "../models/hrReportModel.js";
import { findUserById } from "../models/userModel.js";

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

export async function listHRReportsHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const reports = await listHRReports(limit, offset, { type, status });
    return NextResponse.json({ success: true, data: { reports, total: reports.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function createHRReportHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.type || !body.title) return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    body.generatedBy = user?.id;
    body.status = body.status || 'generating';
    body.generatedAt = body.generatedAt || new Date();
    const created = await createHRReport(body);
    // In a real system we'd enqueue a report generation job. For now return created record.
    return NextResponse.json({ success: true, data: created, message: 'Report queued' }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function getHRReportHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const report = await findHRReportById(params.id);
    if (!report) return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function updateHRReportHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!requireRoles(user, ["super_admin", "hr_manager"])) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const updates = await req.json();
    const updated = await updateHRReport(params.id, updates);
    if (!updated) return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Report updated' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
