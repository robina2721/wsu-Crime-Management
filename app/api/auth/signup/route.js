export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const mod = await import("../../../../backend/controllers/authController.js");
    if (typeof mod.signupCitizenHandler !== "function") {
      throw new Error("signupCitizenHandler not exported");
    }
    return await mod.signupCitizenHandler(req);
  } catch (err) {
    console.error("[api route] signup import/handler error", err);
    return new Response(JSON.stringify({ success: false, message: "Server route error", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
