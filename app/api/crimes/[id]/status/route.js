import {
  getStatusHandler,
  postStatusHandler,
} from "../../../../../backend/controllers/crimesController.js";

export async function GET(req, { params }) {
  return getStatusHandler(req, params);
}

export async function POST(req, { params }) {
  return postStatusHandler(req, params);
}
