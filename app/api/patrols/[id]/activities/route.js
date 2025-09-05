import { addActivityHandler } from "../../../../../backend/controllers/patrolsController.js";

export async function POST(req, { params }) { return addActivityHandler(req, params); }
