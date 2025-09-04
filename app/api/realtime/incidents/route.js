import { incidentsStreamHandler } from "../../../../backend/controllers/realtimeController.js";

export async function GET(req) {
  return incidentsStreamHandler(req);
}
