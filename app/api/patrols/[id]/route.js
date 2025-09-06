import { getPatrolHandler, endPatrolHandler } from "../../../../backend/controllers/patrolsController.js";

export async function GET(req, { params }) { return getPatrolHandler(req, params); }
export async function PATCH(req, { params }) { return endPatrolHandler(req, params); }
