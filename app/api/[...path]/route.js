import { NextResponse } from "next/server";

const BACKEND = (process.env.BACKEND_ORIGIN || "").replace(/\/$/, "");

async function proxy(req, params) {
  if (!BACKEND) {
    return NextResponse.json({ success: false, error: "Backend not configured. Set BACKEND_ORIGIN (e.g. http://localhost:4000)" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const path = Array.isArray(params?.path) ? params.path.join("/") : "";
  const target = `${BACKEND}/api/${path}${qs ? `?${qs}` : ""}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? Buffer.from(await req.arrayBuffer()) : undefined;

  const res = await fetch(target, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const outHeaders = new Headers(res.headers);
  return new Response(res.body, { status: res.status, headers: outHeaders });
}

export async function GET(req, { params }) { return proxy(req, params); }
export async function POST(req, { params }) { return proxy(req, params); }
export async function PUT(req, { params }) { return proxy(req, params); }
export async function PATCH(req, { params }) { return proxy(req, params); }
export async function DELETE(req, { params }) { return proxy(req, params); }
export async function OPTIONS(req, { params }) { return proxy(req, params); }
