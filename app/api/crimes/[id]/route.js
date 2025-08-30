import {
  getHandler,
  updateHandler,
  deleteHandler,
} from "../../../../backend/controllers/crimesController.js";

export async function GET(req, { params }) {
  return getHandler(req, params);
}
export async function PUT(req, { params }) {
  return updateHandler(req, params);
}
export async function DELETE(req, { params }) {
  return deleteHandler(req, params);
}
