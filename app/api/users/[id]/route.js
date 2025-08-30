import {
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../../../../backend/controllers/usersController.js";

export async function GET(req, { params }) {
  return getUserHandler(req, params);
}
export async function PUT(req, { params }) {
  return updateUserHandler(req, params);
}
export async function DELETE(req, { params }) {
  return deleteUserHandler(req, params);
}
