import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // Attempt to use controller's logout handler if available
    const mod = await import(
      "../../../../backend/controllers/authController.js"
    );
    if (typeof mod.logoutHandler === "function") {
      return await mod.logoutHandler(req);
    }
  } catch (err) {
    console.error("[api route] logout import error (falling back)", err);
  }

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
