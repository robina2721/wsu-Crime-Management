import { NextRequest } from "next/server";
import { profileHandler } from "../../../../server/controllers/authController";

export async function GET(req: NextRequest) {
  return profileHandler(req);
}
