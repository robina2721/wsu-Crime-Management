import { NextResponse } from "next/server";
import { getWitnessesByCrime } from "../../../../../backend/models/crimeModel.js";
import { addWitnessesHandler } from "../../../../../backend/controllers/crimesController.js";

export async function GET(req, { params }) {
  try {
    const w = await getWitnessesByCrime(params.id);
    return NextResponse.json({ success: true, data: { witnesses: w } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  return addWitnessesHandler(req, params);
}
