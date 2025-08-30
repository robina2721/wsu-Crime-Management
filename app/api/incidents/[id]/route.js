import {
  getIncidentHandler,
  updateIncidentHandler,
  deleteIncidentHandler,
} from "../../../../backend/controllers/incidentsController.js";

export async function GET(req, { params }) {
  return getIncidentHandler(req, params);
}
export async function PUT(req, { params }) {
  return updateIncidentHandler(req, params);
}
export async function DELETE(req, { params }) {
  return deleteIncidentHandler(req, params);
}
