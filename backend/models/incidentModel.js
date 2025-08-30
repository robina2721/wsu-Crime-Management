import { queryRow, queryRows } from "../../backend/db.js";

export async function listIncidents(limit = 100, offset = 0, filters = {}) {
  const where = [];
  const params = [];
  if (filters.status) {
    where.push(`status = @p${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.incidentType) {
    where.push(`incident_type = @p${params.length + 1}`);
    params.push(filters.incidentType);
  }
  if (filters.severity) {
    where.push(`severity = @p${params.length + 1}`);
    params.push(filters.severity);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(offset);
  params.push(limit);
  return await queryRows(
    `SELECT id, title, description, incident_type as incidentType, severity, location, date_occurred as dateOccurred,
            reported_by as reportedBy, reporter_name as reporterName, status, follow_up_required as followUpRequired,
            related_case_id as relatedCaseId, created_at as createdAt, updated_at as updatedAt
     FROM incidents ${whereSql}
     ORDER BY date_occurred DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params,
  );
}

export async function getIncident(id) {
  return await queryRow(
    `SELECT id, title, description, incident_type as incidentType, severity, location, date_occurred as dateOccurred,
            reported_by as reportedBy, reporter_name as reporterName, status, follow_up_required as followUpRequired,
            related_case_id as relatedCaseId, created_at as createdAt, updated_at as updatedAt
     FROM incidents WHERE id = @p1`,
    [id],
  );
}

export async function createIncident(data) {
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO incidents (id, title, description, incident_type, severity, location, date_occurred, reported_by, reporter_name, status, follow_up_required, related_case_id, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14)`,
    [
      id,
      data.title,
      data.description,
      data.incidentType,
      data.severity || "low",
      data.location,
      new Date(data.dateOccurred),
      data.reportedBy,
      data.reporterName,
      data.status || "reported",
      data.followUpRequired ? 1 : 0,
      data.relatedCaseId || null,
      now,
      now,
    ],
  );
  return await getIncident(id);
}

export async function updateIncident(id, updates) {
  const mapping = {
    incidentType: "incident_type",
    dateOccurred: "date_occurred",
    reportedBy: "reported_by",
    reporterName: "reporter_name",
    followUpRequired: "follow_up_required",
    relatedCaseId: "related_case_id",
  };
  const allowed = new Set([
    "title",
    "description",
    "incident_type",
    "severity",
    "location",
    "date_occurred",
    "reported_by",
    "reporter_name",
    "status",
    "follow_up_required",
    "related_case_id",
  ]);
  const set = [];
  const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === "date_occurred") val = new Date(val);
      if (dbKey === "follow_up_required") val = updates[key] ? 1 : 0;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(
    `UPDATE incidents SET ${set.join(", ")} WHERE id = @p${params.length}`,
    params,
  );
  return await getIncident(id);
}

export async function deleteIncident(id) {
  await queryRows(`DELETE FROM incidents WHERE id = @p1`, [id]);
  return true;
}
