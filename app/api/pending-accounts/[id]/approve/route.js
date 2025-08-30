import { approvePendingHandler } from "../../../../../backend/controllers/pendingAccountsController.js";

export async function POST(req, { params }) {
  return approvePendingHandler(req, params);
}
