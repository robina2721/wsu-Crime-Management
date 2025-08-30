import { crimesStreamHandler } from "../../../../backend/controllers/realtimeController.js";

export async function GET(req) {
  return crimesStreamHandler(req);
}
