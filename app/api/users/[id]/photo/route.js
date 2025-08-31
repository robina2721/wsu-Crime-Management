import {
  uploadUserPhotoHandler,
  getUserPhotoHandler,
} from "../../../../../backend/controllers/usersController.js";

export async function GET(req, { params }) {
  return getUserPhotoHandler(req, params);
}

export async function POST(req, { params }) {
  return uploadUserPhotoHandler(req, params);
}
