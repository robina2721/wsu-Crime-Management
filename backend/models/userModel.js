import { queryRow, queryRows } from "../../backend/db.js";

export async function findUserByUsername(username) {
  return await queryRow(
    `SELECT TOP 1 id, username, password, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as UpdatedAt
     FROM users WHERE username = @p1`,
    [username]
  );
}

export async function findUserById(id) {
  return await queryRow(
    `SELECT TOP 1 id, username, password, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as updatedAt
     FROM users WHERE id = @p1`,
    [id]
  );
}

export async function listUsers(limit = 100, offset = 0, filters = {}) {
  const where = [];
  const params = [];
  if (filters.role) { where.push(`role = @p${params.length + 1}`); params.push(filters.role); }
  if (typeof filters.isActive === 'boolean') { where.push(`is_active = @p${params.length + 1}`); params.push(filters.isActive ? 1 : 0); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(offset); params.push(limit);
  return await queryRows(
    `SELECT id, username, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as updatedAt
     FROM users ${whereSql}
     ORDER BY created_at DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params
  );
}

export async function listActiveOfficersWithCaseCounts(limit = 100, offset = 0) {
  const activeStatuses = [
    'reported',
    'assigned',
    'under_investigation'
  ];
  // Prepare parameters for IN clause
  const params = [];
  for (const s of activeStatuses) params.push(s);
  params.push(offset); params.push(limit);
  const sql = `
    WITH active_cases AS (
      SELECT assigned_to AS officer_id, COUNT(*) AS activeCount
      FROM crimes
      WHERE assigned_to IS NOT NULL AND status IN (${activeStatuses.map((_, i) => `@p${i + 1}`).join(', ')})
      GROUP BY assigned_to
    )
    SELECT u.id, u.username, u.role, u.full_name AS fullName, u.email, u.phone,
           CAST(u.is_active AS INT) AS isActive,
           COALESCE(a.activeCount, 0) AS activeCaseCount
    FROM users u
    LEFT JOIN active_cases a ON a.officer_id = u.id
    WHERE u.is_active = 1 AND u.role IN ('preventive_officer','detective_officer')
    ORDER BY a.activeCount ASC, u.full_name ASC
    OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`;
  return await queryRows(sql, params);
}

export async function createUser(data) {
  const id = (global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID());
  const now = new Date();
  await queryRows(
    `INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10)`,
    [id, data.username, data.password ?? "", data.role, data.fullName, data.email ?? null, data.phone ?? null, data.isActive === false ? 0 : 1, now, now]
  );
  return await findUserById(id);
}

export async function updateUser(id, updates) {
  const mapping = { fullName: 'full_name', isActive: 'is_active' };
  const allowed = new Set(["username","password","role","full_name","email","phone","is_active"]);
  const set = []; const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === 'is_active') val = updates[key] ? 1 : 0;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  if (!set.length) return await findUserById(id);
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(`UPDATE users SET ${set.join(', ')} WHERE id = @p${params.length}` , params);
  return await findUserById(id);
}

export async function deleteUser(id) {
  await queryRows(`DELETE FROM users WHERE id = @p1`, [id]);
  return true;
}
