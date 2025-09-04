import { listActiveOfficersHandler } from "../../../../backend/controllers/crimesController.js";

export async function GET(req) {
  return listActiveOfficersHandler(req);
}
