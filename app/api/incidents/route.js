import { listIncidentsHandler, createIncidentHandler } from "../../../backend/controllers/incidentsController.js";

export async function GET(req) { return listIncidentsHandler(req); }
export async function POST(req) { return createIncidentHandler(req); }
