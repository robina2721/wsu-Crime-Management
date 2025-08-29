import { NextRequest, NextResponse } from "next/server";
import { crimeReports, updateCrime, deleteCrime } from "@shared/mock/crimes";
import { ApiResponse, CrimeReport } from "@shared/types";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const report = crimeReports.find((r) => r.id === params.id);
  if (!report) {
    const response: ApiResponse = { success: false, error: "Crime report not found" };
    return NextResponse.json(response, { status: 404 });
  }
  const response: ApiResponse<CrimeReport> = { success: true, data: report };
  return NextResponse.json(response);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const updated = updateCrime(params.id, updates);
    if (!updated) {
      const response: ApiResponse = { success: false, error: "Crime report not found" };
      return NextResponse.json(response, { status: 404 });
    }
    const response: ApiResponse<CrimeReport> = {
      success: true,
      data: updated,
      message: "Crime report updated successfully",
    };
    return NextResponse.json(response);
  } catch (e) {
    const response: ApiResponse = { success: false, error: "Internal server error" };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteCrime(params.id);
  if (!ok) {
    const response: ApiResponse = { success: false, error: "Crime report not found" };
    return NextResponse.json(response, { status: 404 });
  }
  const response: ApiResponse = { success: true, message: "Crime report deleted successfully" };
  return NextResponse.json(response);
}
