import { loginHandler } from "../../../../backend/controllers/authController.js";

export async function POST(req) {
  return loginHandler(req);
}
