import { NextRequest } from "next/server";
import { listHandler, createHandler } from "../../../server/controllers/crimesController";

export async function GET(req: NextRequest) {
  return listHandler(req);
}

export async function POST(req: NextRequest) {
  return createHandler(req);
}
