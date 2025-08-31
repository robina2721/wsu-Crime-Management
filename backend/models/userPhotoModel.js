import { queryRow, queryRows } from "../../backend/db.js";

async function ensureUserPhotosTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_photos]') AND type in (N'U'))
     BEGIN
       CREATE TABLE user_photos (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         user_id NVARCHAR(64) NOT NULL,
         mime NVARCHAR(128) NOT NULL,
         data_base64 NVARCHAR(MAX) NOT NULL,
         created_at DATETIME2 NOT NULL
       )
     END`,
  );
}

export async function saveUserPhoto(userId, mime, dataBase64) {
  await ensureUserPhotosTable();
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO user_photos (id, user_id, mime, data_base64, created_at) VALUES (@p1, @p2, @p3, @p4, @p5)`,
    [id, userId, mime, dataBase64, now],
  );
  return { id, userId, mime, createdAt: now };
}

export async function getLatestUserPhoto(userId) {
  await ensureUserPhotosTable();
  return await queryRow(
    `SELECT TOP 1 id, user_id as userId, mime, data_base64 as dataBase64, created_at as createdAt FROM user_photos WHERE user_id = @p1 ORDER BY created_at DESC`,
    [userId],
  );
}
