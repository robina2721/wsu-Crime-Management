import { profileHandler } from "../../../../backend/controllers/authController.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  return profileHandler(req);
}
