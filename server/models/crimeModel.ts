import { queryRow, queryRows } from "../db";
import { CrimeReport } from "@shared/types";

export async function listCrimes(filters: any, limit: number, offset: number) {
  const where: string[] = [];
  const params: any[] = [];
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
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  // SQL Server pagination with OFFSET/FETCH
  params.push(offset);
  params.push(limit);
  const rows = await queryRows<any>(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes ${whereSql}
     ORDER BY date_reported DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params
  );
  return rows as CrimeReport[];
}

export async function getCrime(id: string) {
  const row = await queryRow<any>(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes WHERE id = @p1`,
    [id]
  );
  return row as CrimeReport | undefined;
}

export async function createCrime(data: any) {
  const id = (global as any).crypto?.randomUUID?.() || require("crypto").randomUUID();
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
    ]
  );
  return await getCrime(id);
}

export async function updateCrime(id: string, updates: any) {
  const now = new Date();
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
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      params.push(dbKey === "date_incident" ? new Date(updates[key]) : updates[key]);
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

export async function deleteCrime(id: string) {
  await queryRows(`DELETE FROM crimes WHERE id = @p1`, [id]);
  return true;
}
