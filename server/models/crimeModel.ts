import { all, get, run } from "../db";
import { CrimeReport } from "@shared/types";

export async function listCrimes(filters: any, limit: number, offset: number) {
  const where: string[] = [];
  const params: any[] = [];
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters.priority) {
    where.push("priority = ?");
    params.push(filters.priority);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await all<any>(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes ${whereSql}
     ORDER BY datetime(date_reported) DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows as CrimeReport[];
}

export async function getCrime(id: string) {
  const row = await get<any>(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes WHERE id = ?`,
    [id]
  );
  return row as CrimeReport | undefined;
}

export async function createCrime(data: any) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await run(
    `INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'reported', ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      id,
      data.title,
      data.description,
      data.category,
      data.priority ?? "medium",
      data.location,
      now,
      new Date(data.dateIncident).toISOString(),
      data.reportedBy,
      now,
      now,
    ]
  );
  return await getCrime(id);
}

export async function updateCrime(id: string, updates: any) {
  const now = new Date().toISOString();
  // Build dynamic set clause
  const allowed = [
    "title",
    "description",
    "category",
    "status",
    "priority",
    "location",
    "date_incident",
    "reported_by",
    "assigned_to",
  ];
  const set: string[] = [];
  const params: any[] = [];
  for (const key of Object.keys(updates)) {
    const dbKey =
      key === "dateIncident"
        ? "date_incident"
        : key === "reportedBy"
        ? "reported_by"
        : key === "assignedTo"
        ? "assigned_to"
        : key;
    if (allowed.includes(dbKey)) {
      set.push(`${dbKey} = ?`);
      params.push(dbKey === "date_incident" ? new Date(updates[key]).toISOString() : updates[key]);
    }
  }
  set.push("updated_at = ?");
  params.push(now);
  params.push(id);
  await run(`UPDATE crimes SET ${set.join(", ")} WHERE id = ?`, params);
  return await getCrime(id);
}

export async function deleteCrime(id: string) {
  await run(`DELETE FROM crimes WHERE id = ?`, [id]);
  return true;
}
