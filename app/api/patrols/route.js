import { listPatrolsHandler, createPatrolHandler } from "../../../backend/controllers/patrolsController.js";

export async function GET(req) { return listPatrolsHandler(req); }
export async function POST(req) { return createPatrolHandler(req); }
