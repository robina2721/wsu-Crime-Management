import { NextResponse as NextResp } from "next/server";

import { NextResponse as NextResp } from "next/server";

export async function GET() {
  const message = process.env.PING_MESSAGE ?? "ping";
  return NextResp.json({ message });
}
