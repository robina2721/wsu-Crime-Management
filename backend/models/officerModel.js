import { queryRows, queryRow } from "../db.js";

export async function listOfficers(limit = 100, offset = 0, filters = {}) {
  const where = [];
  const params = [];
  if (filters.department) { where.push(`department = @p${params.length + 1}`); params.push(filters.department); }
  if (filters.status) { where.push(`status = @p${params.length + 1}`); params.push(filters.status); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[officers]') AND type in (N'U'))
     BEGIN
       CREATE TABLE officers (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         employee_id NVARCHAR(64) NOT NULL,
         full_name NVARCHAR(256) NULL,
         date_of_birth DATETIME2 NULL,
         national_id NVARCHAR(128) NULL,
         address NVARCHAR(512) NULL,
         phone NVARCHAR(64) NULL,
         email NVARCHAR(128) NULL,
         emergency_contact NVARCHAR(MAX) NULL,
         badge_number NVARCHAR(64) NULL,
         rank NVARCHAR(64) NULL,
         department NVARCHAR(128) NULL,
         start_date DATETIME2 NULL,
         status NVARCHAR(64) NULL,
         supervisor NVARCHAR(128) NULL,
         specializations NVARCHAR(MAX) NULL,
         certifications NVARCHAR(MAX) NULL,
         photo NVARCHAR(1024) NULL,
         created_by NVARCHAR(64) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END;
     SELECT id, employee_id as employeeId, full_name as fullName, date_of_birth as dateOfBirth, national_id as nationalId,
            address, phone, email, emergency_contact as emergencyContact, badge_number as badgeNumber, rank, department,
            start_date as startDate, status, supervisor, specializations, certifications, photo, created_by as createdBy, created_at as createdAt, updated_at as updatedAt
     FROM officers
     ${whereSql}
     ORDER BY created_at DESC
     OFFSET @p${params.length + 1} ROWS FETCH NEXT @p${params.length + 2} ROWS ONLY`,
    [...params, offset, limit]
  );
  return rows.map(r => ({
    ...r,
    dateOfBirth: r.dateOfBirth ? new Date(r.dateOfBirth) : null,
    startDate: r.startDate ? new Date(r.startDate) : null,
    specializations: r.specializations ? JSON.parse(r.specializations) : [],
    certifications: r.certifications ? JSON.parse(r.certifications) : [],
    emergencyContact: r.emergencyContact ? JSON.parse(r.emergencyContact) : null,
  }));
}

export async function findOfficerById(id) {
  const row = await queryRow(
    `SELECT id, employee_id as employeeId, full_name as fullName, date_of_birth as dateOfBirth, national_id as nationalId,
            address, phone, email, emergency_contact as emergencyContact, badge_number as badgeNumber, rank, department,
            start_date as startDate, status, supervisor, specializations, certifications, photo, created_by as createdBy, created_at as createdAt, updated_at as updatedAt
     FROM officers WHERE id = @p1`,
    [id]
  );
  if (!row) return null;
  return {
    ...row,
    dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
    startDate: row.startDate ? new Date(row.startDate) : null,
    specializations: row.specializations ? JSON.parse(row.specializations) : [],
    certifications: row.certifications ? JSON.parse(row.certifications) : [],
    emergencyContact: row.emergencyContact ? JSON.parse(row.emergencyContact) : null,
  };
}

export async function createOfficer(data) {
  const id = (global.crypto?.randomUUID?.() || (await import('node:crypto')).randomUUID());
  const now = new Date();
  await queryRows(
    `INSERT INTO officers (id, employee_id, full_name, date_of_birth, national_id, address, phone, email, emergency_contact, badge_number, rank, department, start_date, status, supervisor, specializations, certifications, photo, created_by, created_at, updated_at)
     VALUES (@p1,@p2,@p3,@p4,@p5,@p6,@p7,@p8,@p9,@p10,@p11,@p12,@p13,@p14,@p15,@p16,@p17,@p18,@p19,@p20,@p21)`,
    [
      id,
      data.employeeId || id,
      data.personalInfo?.fullName || data.fullName || '',
      data.personalInfo?.dateOfBirth ? new Date(data.personalInfo.dateOfBirth) : null,
      data.personalInfo?.nationalId || null,
      data.personalInfo?.address || null,
      data.personalInfo?.phone || null,
      data.personalInfo?.email || null,
      data.personalInfo?.emergencyContact ? JSON.stringify(data.personalInfo.emergencyContact) : null,
      data.professionalInfo?.badgeNumber || null,
      data.professionalInfo?.rank || null,
      data.professionalInfo?.department || null,
      data.professionalInfo?.startDate ? new Date(data.professionalInfo.startDate) : null,
      data.professionalInfo?.status || null,
      data.professionalInfo?.supervisor || null,
      data.professionalInfo?.specializations ? JSON.stringify(data.professionalInfo.specializations) : JSON.stringify([]),
      data.professionalInfo?.certifications ? JSON.stringify(data.professionalInfo.certifications) : JSON.stringify([]),
      data.photo || null,
      data.createdBy || null,
      now,
      now,
    ]
  );
  return await findOfficerById(id);
}

export async function updateOfficer(id, updates) {
  const mapping = { 'fullName': 'full_name', 'dateOfBirth': 'date_of_birth', 'nationalId': 'national_id', 'employeeId': 'employee_id', 'badgeNumber': 'badge_number', 'startDate': 'start_date', 'createdBy': 'created_by' };
  const allowed = new Set(['employee_id','full_name','date_of_birth','national_id','address','phone','email','emergency_contact','badge_number','rank','department','start_date','status','supervisor','specializations','certifications','photo']);
  const set = []; const params = [];
  for (const key of Object.keys(updates)) {
    let dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === 'specializations' || dbKey === 'certifications' || dbKey === 'emergency_contact') {
        val = val ? JSON.stringify(val) : null;
      }
      if (dbKey === 'date_of_birth' || dbKey === 'start_date') val = val ? new Date(val) : null;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  if (!set.length) return await findOfficerById(id);
  const now = new Date();
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  await queryRows(`UPDATE officers SET ${set.join(', ')} WHERE id = @p${params.length}`, params);
  return await findOfficerById(id);
}

export async function deleteOfficer(id) {
  await queryRows(`DELETE FROM officers WHERE id = @p1`, [id]);
  return true;
}
