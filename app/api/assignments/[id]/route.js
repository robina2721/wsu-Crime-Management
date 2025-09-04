import { updateHandler, deleteHandler } from "../../../../backend/controllers/assignmentsController.js";

export async function PUT(req, { params }) { return updateHandler(req, params); }
export async function DELETE(req, { params }) { return deleteHandler(req, params); }
