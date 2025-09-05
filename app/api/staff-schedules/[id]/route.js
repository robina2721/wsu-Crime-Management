import { getStaffScheduleHandler, updateStaffScheduleHandler, deleteStaffScheduleHandler } from "../../../../backend/controllers/staffSchedulesController.js";

export async function GET(req, { params }) { return getStaffScheduleHandler(req, params); }
export async function PUT(req, { params }) { return updateStaffScheduleHandler(req, params); }
export async function DELETE(req, { params }) { return deleteStaffScheduleHandler(req, params); }
