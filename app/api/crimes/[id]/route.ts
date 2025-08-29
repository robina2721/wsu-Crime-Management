import { NextRequest } from "next/server";
import { getHandler, updateHandler, deleteHandler } from "../../../../server/controllers/crimesController";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return getHandler(_req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return updateHandler(req, params);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return deleteHandler(_req, params);
}
