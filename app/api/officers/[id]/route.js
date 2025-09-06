import { getOfficerHandler, updateOfficerHandler, deleteOfficerHandler } from "../../../../backend/controllers/officersController.js";

export async function GET(req, { params }) { return getOfficerHandler(req, params); }
export async function PUT(req, { params }) { return updateOfficerHandler(req, params); }
export async function DELETE(req, { params }) { return deleteOfficerHandler(req, params); }
