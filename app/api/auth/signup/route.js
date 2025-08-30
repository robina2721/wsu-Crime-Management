import { signupCitizenHandler } from "../../../../backend/controllers/authController.js";

export async function POST(req) {
  return signupCitizenHandler(req);
}
