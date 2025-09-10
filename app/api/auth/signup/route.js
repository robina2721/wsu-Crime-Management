import { signupCitizenHandler } from "../../../../backend/controllers/authController.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  return signupCitizenHandler(req);
}
