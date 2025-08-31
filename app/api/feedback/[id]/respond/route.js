import { respondHandler } from "../../../../../backend/controllers/feedbackController.js";

export async function POST(req, { params }) {
  return respondHandler(req, params);
}
