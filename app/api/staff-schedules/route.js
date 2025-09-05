import { listStaffSchedulesHandler, createStaffScheduleHandler } from "../../../backend/controllers/staffSchedulesController.js";

export async function GET(req) { return listStaffSchedulesHandler(req); }
export async function POST(req) { return createStaffScheduleHandler(req); }
