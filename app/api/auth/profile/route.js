import { profileHandler } from "../../../../backend/controllers/authController.js";

export async function GET(req) {
  return profileHandler(req);
}
