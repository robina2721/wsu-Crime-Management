import { listOfficersHandler, createOfficerHandler } from "../../../backend/controllers/officersController.js";

export async function GET(req) { return listOfficersHandler(req); }
export async function POST(req) { return createOfficerHandler(req); }
