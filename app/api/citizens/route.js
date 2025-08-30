import { listCitizensHandler, createCitizenHandler } from "../../../backend/controllers/citizensController.js";

export async function GET(req) { return listCitizensHandler(req); }
export async function POST(req) { return createCitizenHandler(req); }
