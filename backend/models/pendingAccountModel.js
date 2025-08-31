import { queryRow, queryRows } from "../../backend/db.js";

export async function findPendingById(id) {
  return await queryRow(
    `SELECT id, full_name as fullName, username, email, phone, requested_role as requestedRole,
            submitted_date as submittedDate, status, documents, notes, created_at as createdAt, updated_at as updatedAt
     FROM pending_accounts WHERE id = @p1`,
    [id],
  );
}

export async function listPendingAccounts(
  limit = 100,
  offset = 0,
  filters = {},
) {
  const where = [];
  const params = [];
  if (filters.status) {
    where.push(`status = @p${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.requestedRole) {
    where.push(`requested_role = @p${params.length + 1}`);
    params.push(filters.requestedRole);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(offset);
  params.push(limit);
  return await queryRows(
    `SELECT id, full_name as fullName, username, email, phone, requested_role as requestedRole,
            submitted_date as submittedDate, status, documents, notes, created_at as createdAt, updated_at as updatedAt
     FROM pending_accounts ${whereSql}
     ORDER BY submitted_date DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params,
  );
}

export async function createPendingAccount(data) {
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO pending_accounts (id, full_name, username, email, phone, requested_role, submitted_date, status, documents, notes, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12)`,
    [
      id,
      data.fullName,
      data.username,
      data.email ?? null,
      data.phone ?? null,
      data.requestedRole,
      now,
      data.status ?? "pending",
      data.documents ?? null,
      data.notes ?? null,
      now,
      now,
    ],
  );
  return await findPendingById(id);
}

export async function updatePendingAccount(id, updates) {
  const mapping = {
    fullName: "full_name",
    requestedRole: "requested_role",
    submittedDate: "submitted_date",
  };
  const allowed = new Set([
    "full_name",
    "username",
    "email",
    "phone",
    "requested_role",
    "submitted_date",
    "status",
    "documents",
    "notes",
  ]);
  const set = [];
  const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      params.push(
        dbKey === "submitted_date" ? new Date(updates[key]) : updates[key],
      );
      set.push(`${dbKey} = @p${params.length}`);
    }
  }
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(
    `UPDATE pending_accounts SET ${set.join(", ")} WHERE id = @p${params.length}`,
    params,
  );
  return await findPendingById(id);
}

export async function approvePendingAccount(id, toUserData = {}) {
  const pending = await findPendingById(id);
  if (!pending) return null;
  const now = new Date();
  const userId =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  // Determine password
  let plain = toUserData.password || null;
  if (!plain) {
    plain = `Temp${Math.random().toString(36).slice(2, 8)}`;
  }
  const bcrypt = (await import("bcryptjs")).default;
  const hashed = plain.startsWith("$2") ? plain : await bcrypt.hash(plain, 10);
  await queryRows(
    `INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10)`,
    [
      userId,
      toUserData.username || pending.username,
      hashed,
      toUserData.role || pending.requestedRole,
      toUserData.fullName || pending.fullName,
      toUserData.email || pending.email,
      toUserData.phone || pending.phone,
      1,
      now,
      now,
    ],
  );
  await queryRows(
    `UPDATE pending_accounts SET status = @p1, updated_at = @p2 WHERE id = @p3`,
    ["approved", now, id],
  );
  return { userId, pendingId: id, tempPassword: plain };
}

export async function rejectPendingAccount(id, reason = null) {
  const now = new Date();
  await queryRows(
    `UPDATE pending_accounts SET status = @p1, notes = @p2, updated_at = @p3 WHERE id = @p4`,
    ["rejected", reason, now, id],
  );
  return await findPendingById(id);
}
