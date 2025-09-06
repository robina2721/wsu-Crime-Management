import { listHRReportsHandler, createHRReportHandler } from "../../../../backend/controllers/hrReportsController.js";

export async function GET(req) { return listHRReportsHandler(req); }
export async function POST(req) { return createHRReportHandler(req); }
