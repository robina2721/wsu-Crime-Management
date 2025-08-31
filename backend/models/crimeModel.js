import { queryRow, queryRows } from "../../backend/db.js";

export async function listCrimes(filters, limit, offset) {
  const where = [];
  const params = [];
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
  if (filters.reportedBy) {
    where.push(`reported_by = @p${params.length + 1}`);
    params.push(filters.reportedBy);
  }
  if (filters.assignedTo) {
    where.push(`assigned_to = @p${params.length + 1}`);
    params.push(filters.assignedTo);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(offset);
  params.push(limit);
  const rows = await queryRows(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes ${whereSql}
     ORDER BY date_reported DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params,
  );
  return rows;
}

export async function getCrime(id) {
  const crime = await queryRow(
    `SELECT id, title, description, category, status, priority, location,
            date_reported as dateReported, date_incident as dateIncident,
            reported_by as reportedBy, assigned_to as assignedTo, created_at as createdAt, updated_at as updatedAt
     FROM crimes WHERE id = @p1`,
    [id],
  );
  if (!crime) return crime;
  try {
    const [evidence, witnesses] = await Promise.all([
      getEvidenceByCrime(id),
      getWitnessesByCrime(id),
    ]);
    return { ...crime, evidence, witnesses };
  } catch {
    return crime;
  }
}

export async function createCrime(data) {
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
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
    ],
  );
  return await getCrime(id);
}

export async function updateCrime(id, updates) {
  const now = new Date();
  const mapping = {
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
  const set = [];
  const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      params.push(
        dbKey === "date_incident" ? new Date(updates[key]) : updates[key],
      );
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

export async function deleteCrime(id) {
  await queryRows(`DELETE FROM crimes WHERE id = @p1`, [id]);
  return true;
}

// Evidence and Witnesses helpers
async function ensureEvidenceTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_evidence]') AND type in (N'U'))
     BEGIN
       CREATE TABLE crime_evidence (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         crime_id NVARCHAR(64) NOT NULL,
         file_name NVARCHAR(512) NOT NULL,
         file_type NVARCHAR(128) NULL,
         description NVARCHAR(1024) NULL,
         uploaded_by NVARCHAR(64) NULL,
         created_at DATETIME2 NOT NULL
       )
     END`,
  );
}

async function ensureWitnessTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_witnesses]') AND type in (N'U'))
     BEGIN
       CREATE TABLE crime_witnesses (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         crime_id NVARCHAR(64) NOT NULL,
         name NVARCHAR(256) NOT NULL,
         phone NVARCHAR(64) NULL,
         email NVARCHAR(256) NULL,
         statement NVARCHAR(MAX) NULL,
         created_at DATETIME2 NOT NULL
       )
     END`,
  );
}

export async function createEvidenceForCrime(crimeId, files = [], opts = {}) {
  if (!files || files.length === 0) return [];
  await ensureEvidenceTable();
  const now = new Date();
  const created = [];
  for (const f of files) {
    const id =
      global.crypto?.randomUUID?.() ||
      (await import("node:crypto")).randomUUID();
    await queryRows(
      `INSERT INTO crime_evidence (id, crime_id, file_name, file_type, description, uploaded_by, created_at)
       VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)`,
      [
        id,
        crimeId,
        f.fileName || String(f),
        f.fileType || null,
        f.description || null,
        opts.uploadedBy || null,
        now,
      ],
    );
    created.push({
      id,
      crimeId,
      fileName: f.fileName || String(f),
      fileType: f.fileType || null,
      description: f.description || null,
      uploadedBy: opts.uploadedBy || null,
      createdAt: now,
    });
  }
  return created;
}

export async function createWitnessesForCrime(crimeId, witnesses = []) {
  if (!witnesses || witnesses.length === 0) return [];
  await ensureWitnessTable();
  const now = new Date();
  const created = [];
  for (const w of witnesses) {
    const id =
      global.crypto?.randomUUID?.() ||
      (await import("node:crypto")).randomUUID();
    await queryRows(
      `INSERT INTO crime_witnesses (id, crime_id, name, phone, email, statement, created_at)
       VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)`,
      [
        id,
        crimeId,
        w.name || "",
        w.phone || null,
        w.email || null,
        w.statement || null,
        now,
      ],
    );
    created.push({
      id,
      crimeId,
      name: w.name || "",
      phone: w.phone || null,
      email: w.email || null,
      statement: w.statement || null,
      createdAt: now,
    });
  }
  return created;
}

export async function getEvidenceByCrime(crimeId) {
  await ensureEvidenceTable();
  const rows = await queryRows(
    `SELECT id, crime_id as crimeId, file_name as fileName, file_type as fileType, description, uploaded_by as uploadedBy, created_at as createdAt
     FROM crime_evidence WHERE crime_id = @p1 ORDER BY created_at DESC`,
    [crimeId],
  );
  return rows;
}

export async function getWitnessesByCrime(crimeId) {
  await ensureWitnessTable();
  const rows = await queryRows(
    `SELECT id, crime_id as crimeId, name, phone, email, statement, created_at as createdAt
     FROM crime_witnesses WHERE crime_id = @p1 ORDER BY created_at DESC`,
    [crimeId],
  );
  return rows;
}

// Status updates
async function ensureStatusTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_status_updates]') AND type in (N'U'))
     BEGIN
       CREATE TABLE crime_status_updates (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         crime_id NVARCHAR(64) NOT NULL,
         status NVARCHAR(64) NOT NULL,
         notes NVARCHAR(MAX) NULL,
         updated_by NVARCHAR(64) NOT NULL,
         is_visible_to_citizen BIT NOT NULL DEFAULT 1,
         created_at DATETIME2 NOT NULL
       )
     END`,
  );
}

export async function addStatusUpdate(
  crimeId,
  { status, notes, updatedBy, isVisibleToCitizen = true },
) {
  await ensureStatusTable();
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO crime_status_updates (id, crime_id, status, notes, updated_by, is_visible_to_citizen, created_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)`,
    [
      id,
      crimeId,
      status,
      notes ?? null,
      updatedBy,
      isVisibleToCitizen ? 1 : 0,
      now,
    ],
  );
  return {
    id,
    crimeId,
    status,
    notes: notes ?? null,
    updatedBy,
    isVisibleToCitizen: !!isVisibleToCitizen,
    createdAt: now,
  };
}

export async function getStatusUpdatesByCrime(crimeId) {
  await ensureStatusTable();
  return await queryRows(
    `SELECT id, crime_id as crimeId, status, notes, updated_by as updatedBy, CAST(is_visible_to_citizen as INT) as isVisibleToCitizen, created_at as createdAt
     FROM crime_status_updates WHERE crime_id = @p1 ORDER BY created_at DESC`,
    [crimeId],
  );
}

// Messages
async function ensureMessagesTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_messages]') AND type in (N'U'))
     BEGIN
       CREATE TABLE crime_messages (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         crime_id NVARCHAR(64) NOT NULL,
         sender_id NVARCHAR(64) NOT NULL,
         sender_role NVARCHAR(64) NOT NULL,
         message NVARCHAR(MAX) NOT NULL,
         created_at DATETIME2 NOT NULL
       )
     END`,
  );
}

export async function addCrimeMessage(
  crimeId,
  { senderId, senderRole, message },
) {
  await ensureMessagesTable();
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO crime_messages (id, crime_id, sender_id, sender_role, message, created_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6)`,
    [id, crimeId, senderId, senderRole, message, now],
  );
  return { id, crimeId, senderId, senderRole, message, createdAt: now };
}

export async function getCrimeMessages(crimeId, limit = 100, offset = 0) {
  await ensureMessagesTable();
  return await queryRows(
    `SELECT id, crime_id as crimeId, sender_id as senderId, sender_role as senderRole, message, created_at as createdAt
     FROM crime_messages WHERE crime_id = @p1
     ORDER BY created_at DESC
     OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY`,
    [crimeId, offset, limit],
  );
}
