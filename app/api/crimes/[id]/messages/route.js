import { listMessagesHandler, createMessageHandler } from "../../../../../backend/controllers/crimesController.js";

export async function GET(req, { params }) {
  return listMessagesHandler(req, params);
}

export async function POST(req, { params }) {
  return createMessageHandler(req, params);
}
