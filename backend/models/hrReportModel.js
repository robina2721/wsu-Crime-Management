import { queryRows, queryRow } from "../db.js";

export async function listHRReports(limit = 100, offset = 0, filters = {}) {
  const where = [];
  const params = [];
  if (filters.type) { where.push(`type = @p${params.length + 1}`); params.push(filters.type); }
  if (filters.status) { where.push(`status = @p${params.length + 1}`); params.push(filters.status); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hr_reports]') AND type in (N'U'))
     BEGIN
       CREATE TABLE hr_reports (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         type NVARCHAR(64) NOT NULL,
         title NVARCHAR(256) NOT NULL,
         description NVARCHAR(1024) NULL,
         parameters NVARCHAR(MAX) NULL,
         generated_by NVARCHAR(64) NULL,
         generated_at DATETIME2 NULL,
         file_url NVARCHAR(1024) NULL,
         status NVARCHAR(64) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END;
     SELECT id, type, title, description, parameters, generated_by as generatedBy, generated_at as generatedAt, file_url as fileUrl, status, created_at as createdAt, updated_at as updatedAt
     FROM hr_reports
     ${whereSql}
     ORDER BY created_at DESC
     OFFSET @p${params.length + 1} ROWS FETCH NEXT @p${params.length + 2} ROWS ONLY`,
    [...params, offset, limit]
  );
  return rows.map(r => ({
    ...r,
    parameters: r.parameters ? JSON.parse(r.parameters) : null,
    generatedAt: r.generatedAt ? new Date(r.generatedAt) : null,
    createdAt: r.createdAt ? new Date(r.createdAt) : null,
    updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
  }));
}

export async function findHRReportById(id) {
  const row = await queryRow(`SELECT id, type, title, description, parameters, generated_by as generatedBy, generated_at as generatedAt, file_url as fileUrl, status, created_at as createdAt, updated_at as updatedAt FROM hr_reports WHERE id = @p1`, [id]);
  if (!row) return null;
  return {
    ...row,
    parameters: row.parameters ? JSON.parse(row.parameters) : null,
    generatedAt: row.generatedAt ? new Date(row.generatedAt) : null,
    createdAt: row.createdAt ? new Date(row.createdAt) : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
  };
}

export async function createHRReport(data) {
  const id = (global.crypto?.randomUUID?.() || (await import('node:crypto')).randomUUID());
  const now = new Date();
  await queryRows(
    `INSERT INTO hr_reports (id, type, title, description, parameters, generated_by, generated_at, file_url, status, created_at, updated_at)
     VALUES (@p1,@p2,@p3,@p4,@p5,@p6,@p7,@p8,@p9,@p10,@p11)`,
    [
      id,
      data.type,
      data.title,
      data.description || null,
      data.parameters ? JSON.stringify(data.parameters) : null,
      data.generatedBy || null,
      data.generatedAt ? new Date(data.generatedAt) : null,
      data.fileUrl || null,
      data.status || null,
      now,
      now,
    ]
  );
  return await findHRReportById(id);
}

export async function updateHRReport(id, updates) {
  const mapping = { generatedBy: 'generated_by', generatedAt: 'generated_at', fileUrl: 'file_url' };
  const allowed = new Set(['type','title','description','parameters','generated_by','generated_at','file_url','status']);
  const set = []; const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === 'parameters') val = val ? JSON.stringify(val) : null;
      if (dbKey === 'generated_at') val = val ? new Date(val) : null;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  if (!set.length) return await findHRReportById(id);
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(`UPDATE hr_reports SET ${set.join(', ')} WHERE id = @p${params.length}`, params);
  return await findHRReportById(id);
}
