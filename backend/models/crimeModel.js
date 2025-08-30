import { queryRow, queryRows } from "../../backend/db.js";

export async function listCrimes(filters, limit, offset) {
  const where = [];
  const params = [];
  if (filters.status) {
    where.push(`status = @p${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.category) {
    where.push(`category = @p${params.length + 1}`);
    params.push(filters.category);
  }
  if (filters.priority) {
    where.push(`priority = @p${params.length + 1}`);
    params.push(filters.priority);
  }
  if (filters.reportedBy) {
    where.push(`reported_by = @p${params.length + 1}`);
    params.push(filters.reportedBy);
  }
  if (filters.assignedTo) {
    where.push(`assigned_to = @p${params.length + 1}`);
    params.push(filters.assignedTo);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(offset);
  params.push(limit);
  const rows = await queryRows(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes ${whereSql}
     ORDER BY date_reported DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params,
  );
  return rows;
}

export async function getCrime(id) {
  return await queryRow(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes WHERE id = @p1`,
    [id],
  );
}

export async function createCrime(data) {
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, 'reported', @p5, @p6, @p7, @p8, @p9, NULL, @p10, @p11)`,
    [
      id,
      data.title,
      data.description,
      data.category,
      data.priority ?? "medium",
      data.location,
      now,
      new Date(data.dateIncident),
      data.reportedBy,
      now,
      now,
    ],
  );
  return await getCrime(id);
}

export async function updateCrime(id, updates) {
  const now = new Date();
  const mapping = {
    dateIncident: "date_incident",
    reportedBy: "reported_by",
    assignedTo: "assigned_to",
  };
  const allowed = new Set([
    "title",
    "description",
    "category",
    "status",
    "priority",
    "location",
    "date_incident",
    "reported_by",
    "assigned_to",
  ]);
  const set = [];
  const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      params.push(
        dbKey === "date_incident" ? new Date(updates[key]) : updates[key],
      );
      set.push(`${dbKey} = @p${params.length}`);
    }
  }
  params.push(now);
  set.push(`updated_at = @p${params.length}`);
  params.push(id);
  const sql = `UPDATE crimes SET ${set.join(", ")} WHERE id = @p${params.length}`;
  await queryRows(sql, params);
  return await getCrime(id);
}

export async function deleteCrime(id) {
  await queryRows(`DELETE FROM crimes WHERE id = @p1`, [id]);
  return true;
}
