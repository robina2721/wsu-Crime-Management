import { NextResponse } from "next/server";

export async function GET() {
  const message = process.env.PING_MESSAGE ?? "ping";
  return NextResponse.json({ message });
}
