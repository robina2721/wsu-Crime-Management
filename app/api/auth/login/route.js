import { loginHandler } from "../../../../server/controllers/authController.js";
export async function POST(req) { return loginHandler(req); }
