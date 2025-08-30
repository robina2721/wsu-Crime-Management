import {
  listPendingHandler,
  requestAccountHandler,
} from "../../../backend/controllers/pendingAccountsController.js";

export async function GET(req) {
  return listPendingHandler(req);
}
export async function POST(req) {
  return requestAccountHandler(req);
}
