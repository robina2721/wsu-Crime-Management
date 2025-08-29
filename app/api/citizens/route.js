import { createCitizenHandler, listCitizensHandler } from "../../../server/controllers/citizensController.js";
export async function GET(req) { return listCitizensHandler(req); }
export async function POST(req) { return createCitizenHandler(req); }
