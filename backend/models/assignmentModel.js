import { queryRow, queryRows } from "../../backend/db.js";

export async function listAssignments(limit = 100, offset = 0) {
  const rows = await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[staff_assignments]') AND type in (N'U'))
     BEGIN
       CREATE TABLE staff_assignments (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         officer_id NVARCHAR(64) NOT NULL,
         officer_name NVARCHAR(128) NULL,
         assignment NVARCHAR(256) NOT NULL,
         location NVARCHAR(128) NULL,
         start_time DATETIME2 NULL,
         end_time DATETIME2 NULL,
         status NVARCHAR(32) NOT NULL,
         priority NVARCHAR(32) NOT NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END;
     SELECT id, officer_id as officerId, officer_name as officerName, assignment, location,
            start_time as startTime, end_time as endTime, status, priority, created_at as createdAt, updated_at as updatedAt
     FROM staff_assignments
     ORDER BY created_at DESC
     OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY`,
    [offset, limit]
  );
  return rows;
}

export async function createAssignment(data) {
  const id = (global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID());
  const now = new Date();
  await queryRows(
    `INSERT INTO staff_assignments (id, officer_id, officer_name, assignment, location, start_time, end_time, status, priority, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11)`,
    [id, data.officerId, data.officerName ?? null, data.assignment, data.location ?? null,
     data.startTime ? new Date(data.startTime) : null, data.endTime ? new Date(data.endTime) : null,
     data.status ?? "active", data.priority ?? "medium", now, now]
  );
  return await queryRow(`SELECT id, officer_id as officerId, officer_name as officerName, assignment, location, start_time as startTime, end_time as endTime, status, priority, created_at as createdAt, updated_at as updatedAt FROM staff_assignments WHERE id = @p1`, [id]);
}

export async function updateAssignment(id, updates) {
  const mapping = { officerId: 'officer_id', officerName: 'officer_name', startTime: 'start_time', endTime: 'end_time' };
  const allowed = new Set(['officer_id','officer_name','assignment','location','start_time','end_time','status','priority']);
  const set = []; const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === 'start_time' || dbKey === 'end_time') val = val ? new Date(val) : null;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(`UPDATE staff_assignments SET ${set.join(', ')} WHERE id = @p${params.length}`, params);
  return await queryRow(`SELECT id, officer_id as officerId, officer_name as officerName, assignment, location, start_time as startTime, end_time as endTime, status, priority, created_at as createdAt, updated_at as updatedAt FROM staff_assignments WHERE id = @p1`, [id]);
}

export async function deleteAssignment(id) {
  await queryRows(`DELETE FROM staff_assignments WHERE id = @p1`, [id]);
  return true;
}
