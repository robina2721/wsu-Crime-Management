import { getHRReportHandler, updateHRReportHandler } from "../../../../../backend/controllers/hrReportsController.js";

export async function GET(req, { params }) { return getHRReportHandler(req, params); }
export async function PUT(req, { params }) { return updateHRReportHandler(req, params); }
