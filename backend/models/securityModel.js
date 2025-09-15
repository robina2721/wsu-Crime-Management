import { queryRow, queryRows } from "../../backend/db.js";

async function ensureFailedLoginTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[failed_login_attempts]') AND type in (N'U'))
     BEGIN
       CREATE TABLE failed_login_attempts (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         username NVARCHAR(128) NULL,
         user_id NVARCHAR(64) NULL,
         ip_address NVARCHAR(64) NULL,
         country NVARCHAR(128) NULL,
         success BIT NOT NULL,
         reason NVARCHAR(256) NULL,
         attempted_password_hash NVARCHAR(255) NULL,
         attempted_password_masked NVARCHAR(255) NULL,
         attempt_time DATETIME2 NOT NULL
       )
     END;
     IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'attempted_password_hash' AND Object_ID = Object_ID(N'dbo.failed_login_attempts'))
     BEGIN
       ALTER TABLE failed_login_attempts ADD attempted_password_hash NVARCHAR(255) NULL;
     END;
     IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'attempted_password_masked' AND Object_ID = Object_ID(N'dbo.failed_login_attempts'))
     BEGIN
       ALTER TABLE failed_login_attempts ADD attempted_password_masked NVARCHAR(255) NULL;
     END`);
}

export async function recordLoginAttempt({ username, userId, ip, country, success, reason, attemptedPasswordHash = null, attemptedPasswordMasked = null }) {
  await ensureFailedLoginTable();
  const id = global.crypto?.randomUUID?.() || (await import('node:crypto')).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO failed_login_attempts (id, username, user_id, ip_address, country, success, reason, attempted_password_hash, attempted_password_masked, attempt_time)
     VALUES (@p1,@p2,@p3,@p4,@p5,@p6,@p7,@p8,@p9,@p10)`,
    [id, username ?? null, userId ?? null, ip ?? null, country ?? null, success ? 1 : 0, reason ?? null, attemptedPasswordHash ?? null, attemptedPasswordMasked ?? null, now]
  );
  return { id, username, userId, ip, country, success: !!success, reason, attemptTime: now };
}

export async function countRecentFailedAttempts({ userId, username, minutes = 60 }) {
  await ensureFailedLoginTable();
  const since = new Date(Date.now() - minutes * 60 * 1000);
  if (userId) {
    const rows = await queryRows(
      `SELECT COUNT(*) as cnt FROM failed_login_attempts WHERE user_id = @p1 AND success = 0 AND attempt_time >= @p2`,
      [userId, since]
    );
    return rows[0]?.cnt ? Number(rows[0].cnt) : 0;
  }
  if (username) {
    const rows = await queryRows(
      `SELECT COUNT(*) as cnt FROM failed_login_attempts WHERE username = @p1 AND success = 0 AND attempt_time >= @p2`,
      [username, since]
    );
    return rows[0]?.cnt ? Number(rows[0].cnt) : 0;
  }
  return 0;
}

export async function clearFailedAttemptsForUser(userId) {
  await ensureFailedLoginTable();
  await queryRows(`DELETE FROM failed_login_attempts WHERE user_id = @p1`, [userId]);
  return true;
}

export async function listAudit(limit = 100, offset = 0, filters = {}) {
  await ensureFailedLoginTable();
  const where = [];
  const params = [];
  if (filters.username) { where.push(`username = @p${params.length + 1}`); params.push(filters.username); }
  if (filters.userId) { where.push(`user_id = @p${params.length + 1}`); params.push(filters.userId); }
  if (typeof filters.success === 'boolean') { where.push(`success = @p${params.length + 1}`); params.push(filters.success ? 1 : 0); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  params.push(offset); params.push(limit);
  const rows = await queryRows(
    `SELECT id, username, user_id as userId, ip_address as ipAddress, country, success, reason,
            attempted_password_masked as attemptedPasswordMasked,
            attempt_time as attemptTime
     FROM failed_login_attempts ${whereSql}
     ORDER BY attempt_time DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`, params);
  return rows;
}
