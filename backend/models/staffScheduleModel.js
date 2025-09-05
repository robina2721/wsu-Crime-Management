import { queryRows, queryRow } from "../db.js";

export async function listStaffSchedules(limit = 100, offset = 0, filters = {}) {
  const where = [];
  const params = [];
  if (filters.officerId) { where.push(`officer_id = @p${params.length + 1}`); params.push(filters.officerId); }
  if (filters.startDate) { where.push(`start_date >= @p${params.length + 1}`); params.push(new Date(filters.startDate)); }
  if (filters.endDate) { where.push(`end_date <= @p${params.length + 1}`); params.push(new Date(filters.endDate)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[staff_schedules]') AND type in (N'U'))
     BEGIN
       CREATE TABLE staff_schedules (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         officer_id NVARCHAR(64) NOT NULL,
         officer_name NVARCHAR(128) NULL,
         shift NVARCHAR(64) NULL,
         start_date DATETIME2 NULL,
         end_date DATETIME2 NULL,
         assignment NVARCHAR(MAX) NULL,
         status NVARCHAR(64) NULL,
         notes NVARCHAR(1024) NULL,
         created_by NVARCHAR(64) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END;
     SELECT id, officer_id as officerId, officer_name as officerName, shift, start_date as startDate, end_date as endDate, assignment, status, notes, created_by as createdBy, created_at as createdAt, updated_at as updatedAt
     FROM staff_schedules
     ${whereSql}
     ORDER BY start_date DESC
     OFFSET @p${params.length + 1} ROWS FETCH NEXT @p${params.length + 2} ROWS ONLY`,
    [...params, offset, limit]
  );
  return rows.map(r => ({
    ...r,
    startDate: r.startDate ? new Date(r.startDate) : null,
    endDate: r.endDate ? new Date(r.endDate) : null,
    assignment: r.assignment ? JSON.parse(r.assignment) : null,
  }));
}

export async function findStaffScheduleById(id) {
  const row = await queryRow(`SELECT id, officer_id as officerId, officer_name as officerName, shift, start_date as startDate, end_date as endDate, assignment, status, notes, created_by as createdBy, created_at as createdAt, updated_at as updatedAt FROM staff_schedules WHERE id = @p1`, [id]);
  if (!row) return null;
  return {
    ...row,
    startDate: row.startDate ? new Date(row.startDate) : null,
    endDate: row.endDate ? new Date(row.endDate) : null,
    assignment: row.assignment ? JSON.parse(row.assignment) : null,
  };
}

export async function createStaffSchedule(data) {
  const id = (global.crypto?.randomUUID?.() || (await import('node:crypto')).randomUUID());
  const now = new Date();
  await queryRows(
    `INSERT INTO staff_schedules (id, officer_id, officer_name, shift, start_date, end_date, assignment, status, notes, created_by, created_at, updated_at)
     VALUES (@p1,@p2,@p3,@p4,@p5,@p6,@p7,@p8,@p9,@p10,@p11,@p12)`,
    [
      id,
      data.officerId,
      data.officerName || null,
      data.shift || null,
      data.startDate ? new Date(data.startDate) : null,
      data.endDate ? new Date(data.endDate) : null,
      data.assignment ? JSON.stringify(data.assignment) : null,
      data.status || null,
      data.notes || null,
      data.createdBy || null,
      now,
      now,
    ]
  );
  return await findStaffScheduleById(id);
}

export async function updateStaffSchedule(id, updates) {
  const mapping = { officerId: 'officer_id', officerName: 'officer_name', startDate: 'start_date', endDate: 'end_date' };
  const allowed = new Set(['officer_id','officer_name','shift','start_date','end_date','assignment','status','notes']);
  const set = []; const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === 'assignment') val = val ? JSON.stringify(val) : null;
      if (dbKey === 'start_date' || dbKey === 'end_date') val = val ? new Date(val) : null;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  if (!set.length) return await findStaffScheduleById(id);
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(`UPDATE staff_schedules SET ${set.join(', ')} WHERE id = @p${params.length}`, params);
  return await findStaffScheduleById(id);
}

export async function deleteStaffSchedule(id) {
  await queryRows(`DELETE FROM staff_schedules WHERE id = @p1`, [id]);
  return true;
}
