import { query, queryOne } from "../db";
import { CrimeReport } from "@shared/types";

export async function listCrimes(filters: any, limit: number, offset: number) {
  const where: string[] = [];
  const params: any[] = [];
  if (filters.status) {
    where.push(`status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.category) {
    where.push(`category = $${params.length + 1}`);
    params.push(filters.category);
  }
  if (filters.priority) {
    where.push(`priority = $${params.length + 1}`);
    params.push(filters.priority);
  }
  params.push(limit);
  params.push(offset);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await query<any>(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as "dateReported", date_incident as "dateIncident",
            reported_by as "reportedBy", assigned_to as "assignedTo", created_at as "createdAt", updated_at as "updatedAt"
     FROM crimes ${whereSql}
     ORDER BY date_reported DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows as CrimeReport[];
}

export async function getCrime(id: string) {
  const row = await queryOne<any>(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as "dateReported", date_incident as "dateIncident",
            reported_by as "reportedBy", assigned_to as "assignedTo", created_at as "createdAt", updated_at as "updatedAt"
     FROM crimes WHERE id = $1`,
    [id]
  );
  return row as CrimeReport | undefined;
}

export async function createCrime(data: any) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await query(
    `INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'reported', $5, $6, $7, $8, $9, NULL, $10, $11)`,
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
  const mapping: Record<string, string> = {
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
  const set: string[] = [];
  const params: any[] = [];
  let i = 1;
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      set.push(`${dbKey} = $${i++}`);
      params.push(dbKey === "date_incident" ? new Date(updates[key]).toISOString() : updates[key]);
    }
  }
  set.push(`updated_at = $${i++}`);
  params.push(now);
  params.push(id);
  await query(`UPDATE crimes SET ${set.join(", ")} WHERE id = $${i}` as string, params);
  return await getCrime(id);
}

export async function deleteCrime(id: string) {
  await query(`DELETE FROM crimes WHERE id = $1`, [id]);
  return true;
}
