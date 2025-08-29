import { profileHandler } from "../../../../server/controllers/authController.js";
export async function GET(req) { return profileHandler(req); }
