import { uploadEvidenceHandler, getHandler } from "../../../../../backend/controllers/crimesController.js";
import { NextResponse } from "next/server";
import { getEvidenceByCrime, getCrime } from "../../../../../backend/models/crimeModel.js";

export async function GET(_req, { params }) {
  try {
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const evidence = await getEvidenceByCrime(report.id);
    return NextResponse.json({ success: true, data: { evidence } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function POST(req, { params }) {
  return uploadEvidenceHandler(req, params);
}
