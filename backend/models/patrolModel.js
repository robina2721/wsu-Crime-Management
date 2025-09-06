import { queryRow, queryRows } from "../../backend/db.js";

async function ensurePatrolTables() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patrol_logs]') AND type in (N'U'))
     BEGIN
       CREATE TABLE patrol_logs (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         officer_id NVARCHAR(64) NOT NULL,
         officer_name NVARCHAR(256) NULL,
         shift NVARCHAR(32) NOT NULL,
         start_time DATETIME2 NOT NULL,
         end_time DATETIME2 NULL,
         route NVARCHAR(256) NOT NULL,
         area NVARCHAR(256) NOT NULL,
         status NVARCHAR(32) NOT NULL,
         notes NVARCHAR(MAX) NULL,
         mileage_start INT NULL,
         mileage_end INT NULL,
         vehicle_id NVARCHAR(64) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END`);
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patrol_activities]') AND type in (N'U'))
     BEGIN
       CREATE TABLE patrol_activities (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         log_id NVARCHAR(64) NOT NULL,
         time DATETIME2 NOT NULL,
         activity NVARCHAR(256) NOT NULL,
         location NVARCHAR(256) NOT NULL,
         description NVARCHAR(MAX) NULL,
         type NVARCHAR(32) NOT NULL,
         created_at DATETIME2 NOT NULL
       )
     END`);
}

export async function listPatrols(limit = 100, offset = 0, { officerId } = {}) {
  await ensurePatrolTables();
  const where = [];
  const params = [];
  if (officerId) { where.push(`officer_id = @p${params.length + 1}`); params.push(officerId); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  params.push(offset); params.push(limit);
  const rows = await queryRows(
    `SELECT id, officer_id as officerId, officer_name as officerName, shift, start_time as startTime, end_time as endTime,
            route, area, status, notes, mileage_start as mileageStart, mileage_end as mileageEnd, vehicle_id as vehicleId,
            created_at as createdAt, updated_at as updatedAt
     FROM patrol_logs ${whereSql}
     ORDER BY start_time DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`, params);
  return rows;
}

export async function getPatrol(id) {
  await ensurePatrolTables();
  const log = await queryRow(
    `SELECT id, officer_id as officerId, officer_name as officerName, shift, start_time as startTime, end_time as endTime,
            route, area, status, notes, mileage_start as mileageStart, mileage_end as mileageEnd, vehicle_id as vehicleId,
            created_at as createdAt, updated_at as updatedAt
     FROM patrol_logs WHERE id = @p1`, [id]);
  if (!log) return null;
  const activities = await queryRows(
    `SELECT id, log_id as logId, time, activity, location, description, type, created_at as createdAt
     FROM patrol_activities WHERE log_id = @p1 ORDER BY time ASC`, [id]);
  return { ...log, activities };
}

export async function createPatrol(data) {
  await ensurePatrolTables();
  const id = global.crypto?.randomUUID?.() || (await import('node:crypto')).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO patrol_logs (id, officer_id, officer_name, shift, start_time, end_time, route, area, status, notes, mileage_start, mileage_end, vehicle_id, created_at, updated_at)
     VALUES (@p1,@p2,@p3,@p4,@p5,NULL,@p6,@p7,'active',@p8,@p9,NULL,@p10,@p11,@p12)`,
    [id, data.officerId, data.officerName ?? null, data.shift, new Date(data.startTime || now), data.route, data.area, data.notes ?? null, data.mileageStart ?? null, data.vehicleId ?? null, now, now]
  );
  // Add initial activity
  if (data.initialActivity) {
    await addPatrolActivity(id, {
      time: data.initialActivity.time || now,
      activity: data.initialActivity.activity,
      location: data.initialActivity.location,
      description: data.initialActivity.description || null,
      type: data.initialActivity.type || 'patrol'
    });
  }
  return await getPatrol(id);
}

export async function endPatrol(id, { mileageEnd } = {}) {
  await ensurePatrolTables();
  const now = new Date();
  await queryRows(
    `UPDATE patrol_logs SET end_time = @p1, status = 'completed', mileage_end = @p2, updated_at = @p3 WHERE id = @p4`,
    [now, typeof mileageEnd === 'number' ? mileageEnd : null, now, id]
  );
  await addPatrolActivity(id, { time: now, activity: 'Patrol completed', location: 'Police Station', type: 'patrol' });
  return await getPatrol(id);
}

export async function addPatrolActivity(logId, { time, activity, location, description, type }) {
  await ensurePatrolTables();
  const id = global.crypto?.randomUUID?.() || (await import('node:crypto')).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO patrol_activities (id, log_id, time, activity, location, description, type, created_at)
     VALUES (@p1,@p2,@p3,@p4,@p5,@p6,@p7,@p8)`,
    [id, logId, new Date(time || now), activity, location, description ?? null, type, now]
  );
  return await queryRow(
    `SELECT id, log_id as logId, time, activity, location, description, type, created_at as createdAt FROM patrol_activities WHERE id = @p1`,
    [id]
  );
}
