import { listAuditHandler } from "../../../../../backend/controllers/securityController.js";

export async function GET(req) { return listAuditHandler(req); }
