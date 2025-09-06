import { resetPasswordHandler } from "../../../../../backend/controllers/usersController.js";

export async function POST(req, { params }) { return resetPasswordHandler(req, params); }
