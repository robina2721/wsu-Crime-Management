import { NextRequest, NextResponse } from "next/server";
import { crimeReports, createCrime } from "@shared/mock/crimes";
import { ApiResponse, CrimeReport } from "@shared/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  let filtered = [...crimeReports];
  if (status) filtered = filtered.filter((r) => r.status === status);
  if (category) filtered = filtered.filter((r) => r.category === category);
  if (priority) filtered = filtered.filter((r) => r.priority === priority);

  filtered.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

  const paginated = filtered.slice(offset, offset + limit);

  const response: ApiResponse<{ reports: CrimeReport[]; total: number; limit: number; offset: number }> = {
    success: true,
    data: { reports: paginated, total: filtered.length, limit, offset },
  };
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["title", "description", "category", "location", "dateIncident", "reportedBy"];
    for (const key of required) {
      if (!body[key]) {
        const response: ApiResponse = { success: false, error: "Missing required fields" };
        return NextResponse.json(response, { status: 400 });
      }
    }
    const created = createCrime(body);
    const response: ApiResponse<CrimeReport> = {
      success: true,
      data: created,
      message: "Crime report created successfully",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    const response: ApiResponse = { success: false, error: "Internal server error" };
    return NextResponse.json(response, { status: 500 });
  }
}
