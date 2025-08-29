import { listHandler, createHandler } from "../../../server/controllers/crimesController.js";
export async function GET(req) { return listHandler(req); }
export async function POST(req) { return createHandler(req); }
