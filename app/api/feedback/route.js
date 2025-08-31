import { listHandler, createHandler } from "../../../backend/controllers/feedbackController.js";

export async function GET(req) {
  return listHandler(req);
}

export async function POST(req) {
  return createHandler(req);
}
