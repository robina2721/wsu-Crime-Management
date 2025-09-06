import { reactivateUserHandler } from "../../../../../backend/controllers/securityController.js";

export async function POST(req, { params }) { return reactivateUserHandler(req, params); }
