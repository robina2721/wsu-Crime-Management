import { rejectPendingHandler } from "../../../../../backend/controllers/pendingAccountsController.js";

export async function POST(req, { params }) { return rejectPendingHandler(req, params); }
