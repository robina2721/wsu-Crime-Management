import { queryRow, queryRows } from "../../backend/db.js";

async function ensureTables() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminal_convictions]') AND type in (N'U'))
     BEGIN
       CREATE TABLE criminal_convictions (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         criminal_id NVARCHAR(64) NOT NULL,
         crime_type NVARCHAR(64) NULL,
         description NVARCHAR(512) NULL,
         date DATETIME2 NULL,
         sentence NVARCHAR(256) NULL,
         court NVARCHAR(128) NULL,
         case_number NVARCHAR(64) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END`);
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminal_arrests]') AND type in (N'U'))
     BEGIN
       CREATE TABLE criminal_arrests (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         criminal_id NVARCHAR(64) NOT NULL,
         date DATETIME2 NULL,
         disposition NVARCHAR(64) NULL,
         charges NVARCHAR(MAX) NULL,
         arresting_officer NVARCHAR(128) NULL,
         location NVARCHAR(128) NULL,
         notes NVARCHAR(512) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END`);
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminal_warrants]') AND type in (N'U'))
     BEGIN
       CREATE TABLE criminal_warrants (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         criminal_id NVARCHAR(64) NOT NULL,
         type NVARCHAR(32) NULL,
         issue_date DATETIME2 NULL,
         expiry_date DATETIME2 NULL,
         issuing_court NVARCHAR(128) NULL,
         status NVARCHAR(32) NULL,
         charges NVARCHAR(MAX) NULL,
         created_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END`);
}

function newId() {
  return global.crypto?.randomUUID?.() || require("node:crypto").randomUUID();
}

export async function listConvictions(criminalId) {
  await ensureTables();
  const rows = await queryRows(
    `SELECT id, criminal_id as criminalId, crime_type as crimeType, description, date, sentence, court, case_number as caseNumber, created_at as createdAt, updated_at as updatedAt
     FROM criminal_convictions WHERE criminal_id = @p1 ORDER BY date DESC, created_at DESC`,
    [criminalId]
  );
  return rows.map(r => ({ ...r, date: r.date ? new Date(r.date) : null }));
}

export async function listArrests(criminalId) {
  await ensureTables();
  const rows = await queryRows(
    `SELECT id, criminal_id as criminalId, date, disposition, charges, arresting_officer as arrestingOfficer, location, notes, created_at as createdAt, updated_at as updatedAt
     FROM criminal_arrests WHERE criminal_id = @p1 ORDER BY date DESC, created_at DESC`,
    [criminalId]
  );
  return rows.map(r => ({ ...r, date: r.date ? new Date(r.date) : null, charges: r.charges ? r.charges.split('\n').map(s => s.trim()).filter(Boolean) : [] }));
}

export async function listWarrants(criminalId) {
  await ensureTables();
  const rows = await queryRows(
    `SELECT id, criminal_id as criminalId, type, issue_date as issueDate, expiry_date as expiryDate, issuing_court as issuingCourt, status, charges, created_at as createdAt, updated_at as updatedAt
     FROM criminal_warrants WHERE criminal_id = @p1 ORDER BY issue_date DESC, created_at DESC`,
    [criminalId]
  );
  return rows.map(r => ({ ...r, issueDate: r.issueDate ? new Date(r.issueDate) : null, expiryDate: r.expiryDate ? new Date(r.expiryDate) : null, charges: r.charges ? r.charges.split('\n').map(s => s.trim()).filter(Boolean) : [] }));
}

export async function createConviction(criminalId, data) {
  await ensureTables();
  const id = newId();
  const now = new Date();
  await queryRows(
    `INSERT INTO criminal_convictions (id, criminal_id, crime_type, description, date, sentence, court, case_number, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10)`,
    [id, criminalId, data.crimeType ?? null, data.description ?? null, data.date ? new Date(data.date) : null, data.sentence ?? null, data.court ?? null, data.caseNumber ?? null, now, now]
  );
  return await queryRow(`SELECT id FROM criminal_convictions WHERE id = @p1`, [id]);
}

export async function createArrest(criminalId, data) {
  await ensureTables();
  const id = newId();
  const now = new Date();
  await queryRows(
    `INSERT INTO criminal_arrests (id, criminal_id, date, disposition, charges, arresting_officer, location, notes, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10)`,
    [id, criminalId, data.date ? new Date(data.date) : null, data.disposition ?? null, Array.isArray(data.charges) ? data.charges.join('\n') : (data.charges ?? null), data.arrestingOfficer ?? null, data.location ?? null, data.notes ?? null, now, now]
  );
  return await queryRow(`SELECT id FROM criminal_arrests WHERE id = @p1`, [id]);
}

export async function createWarrant(criminalId, data) {
  await ensureTables();
  const id = newId();
  const now = new Date();
  await queryRows(
    `INSERT INTO criminal_warrants (id, criminal_id, type, issue_date, expiry_date, issuing_court, status, charges, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10)`,
    [id, criminalId, data.type ?? null, data.issueDate ? new Date(data.issueDate) : null, data.expiryDate ? new Date(data.expiryDate) : null, data.issuingCourt ?? null, data.status ?? null, Array.isArray(data.charges) ? data.charges.join('\n') : (data.charges ?? null), now, now]
  );
  return await queryRow(`SELECT id FROM criminal_warrants WHERE id = @p1`, [id]);
}
