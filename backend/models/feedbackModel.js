import { queryRow, queryRows } from "../../backend/db.js";

async function ensureFeedbackTable() {
  await queryRows(
    `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[citizen_feedback]') AND type in (N'U'))
     BEGIN
       CREATE TABLE citizen_feedback (
         id NVARCHAR(64) NOT NULL PRIMARY KEY,
         citizen_id NVARCHAR(64) NOT NULL,
         citizen_name NVARCHAR(256) NULL,
         email NVARCHAR(256) NULL,
         phone NVARCHAR(64) NULL,
         feedback_type NVARCHAR(64) NOT NULL,
         category NVARCHAR(64) NOT NULL,
         subject NVARCHAR(256) NOT NULL,
         message NVARCHAR(MAX) NOT NULL,
         related_case_id NVARCHAR(64) NULL,
         priority NVARCHAR(32) NOT NULL,
         status NVARCHAR(64) NOT NULL,
         response NVARCHAR(MAX) NULL,
         responded_by_id NVARCHAR(64) NULL,
         responded_by_name NVARCHAR(256) NULL,
         responded_at DATETIME2 NULL,
         is_anonymous BIT NOT NULL DEFAULT 0,
         submitted_at DATETIME2 NOT NULL,
         updated_at DATETIME2 NOT NULL
       )
     END`,
  );
}

export async function listFeedback(limit = 100, offset = 0, filters = {}) {
  await ensureFeedbackTable();
  const where = [];
  const params = [];
  if (filters.type) {
    where.push(`feedback_type = @p${params.length + 1}`);
    params.push(filters.type);
  }
  if (filters.status) {
    where.push(`status = @p${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.category) {
    where.push(`category = @p${params.length + 1}`);
    params.push(filters.category);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(offset);
  params.push(limit);
  const rows = await queryRows(
    `SELECT id, citizen_id as citizenId, citizen_name as citizenName, email, phone, 
            feedback_type as feedbackType, category, subject, message, related_case_id as relatedCaseId,
            priority, status, response, responded_by_id as respondedById, responded_by_name as respondedBy,
            responded_at as respondedAt, CAST(is_anonymous as INT) as isAnonymous,
            submitted_at as submittedAt, updated_at as updatedAt
     FROM citizen_feedback ${whereSql}
     ORDER BY submitted_at DESC
     OFFSET @p${params.length - 1} ROWS FETCH NEXT @p${params.length} ROWS ONLY`,
    params,
  );
  return rows;
}

export async function getFeedback(id) {
  await ensureFeedbackTable();
  return await queryRow(
    `SELECT id, citizen_id as citizenId, citizen_name as citizenName, email, phone, 
            feedback_type as feedbackType, category, subject, message, related_case_id as relatedCaseId,
            priority, status, response, responded_by_id as respondedById, responded_by_name as respondedBy,
            responded_at as respondedAt, CAST(is_anonymous as INT) as isAnonymous,
            submitted_at as submittedAt, updated_at as updatedAt
     FROM citizen_feedback WHERE id = @p1`,
    [id],
  );
}

export async function createFeedback(data) {
  await ensureFeedbackTable();
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO citizen_feedback (id, citizen_id, citizen_name, email, phone, feedback_type, category, subject, message,
                                   related_case_id, priority, status, response, responded_by_id, responded_by_name, responded_at,
                                   is_anonymous, submitted_at, updated_at)
     VALUES (@p1,@p2,@p3,@p4,@p5,@p6,@p7,@p8,@p9,@p10,@p11,'submitted',NULL,NULL,NULL,NULL,@p12,@p13,@p14)`,
    [
      id,
      data.citizenId,
      data.citizenName ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.feedbackType,
      data.category,
      data.subject,
      data.message,
      data.relatedCaseId ?? null,
      data.priority ?? "medium",
      data.isAnonymous ? 1 : 0,
      now,
      now,
    ],
  );
  return await getFeedback(id);
}

export async function respondFeedback(
  id,
  { response, status, respondedById, respondedByName },
) {
  await ensureFeedbackTable();
  const now = new Date();
  const s = status || "under_review";
  await queryRows(
    `UPDATE citizen_feedback SET response = @p1, status = @p2, responded_by_id = @p3, responded_by_name = @p4,
      responded_at = @p5, updated_at = @p6 WHERE id = @p7`,
    [
      response ?? null,
      s,
      respondedById ?? null,
      respondedByName ?? null,
      now,
      now,
      id,
    ],
  );
  return await getFeedback(id);
}
