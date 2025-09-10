export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const mod = await import(
      "../../../../backend/controllers/authController.js"
    );
    if (typeof mod.profileHandler !== "function") {
      throw new Error("profileHandler not exported");
    }
    return await mod.profileHandler(req);
  } catch (err) {
    console.error("[api route] profile import/handler error", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server route error",
        details:
          process.env.NODE_ENV !== "production" ? String(err) : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
