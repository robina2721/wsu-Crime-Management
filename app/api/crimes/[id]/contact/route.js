import { contactOfficerHandler } from "../../../../../backend/controllers/crimesController.js";

import { contactOfficerHandler } from "../../../../../backend/controllers/crimesController.js";

export async function POST(req, { params }) {
  return contactOfficerHandler(req, params);
}
