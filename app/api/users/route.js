import { listUsersHandler, createUserHandler } from "../../../server/controllers/usersController.js";
export async function GET(req) { return listUsersHandler(req); }
export async function POST(req) { return createUserHandler(req); }
