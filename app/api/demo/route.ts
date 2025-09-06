import { NextResponse as NextResp } from "next/server";
import { NextResponse as NextResp } from "next/server";
import { DemoResponse } from "@shared/api";

export async function GET() {
  const response: DemoResponse = { message: "Hello from Next API" };
  return NextResp.json(response);
}
