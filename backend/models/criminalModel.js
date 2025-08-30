import { queryRow, queryRows } from "../../backend/db.js";

function toRecord(row) {
  // Shape into shared/types CriminalRecord-like structure
  return {
    id: row.id,
    personalInfo: {
      fullName: row.full_name,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      nationalId: row.national_id,
      address: row.address,
      phone: row.phone,
      photo: row.photo_path,
      aliases: row.aliases ? row.aliases.split(",").map(s => s.trim()).filter(Boolean) : [],
    },
    physicalDescription: {
      height: row.height_cm,
      weight: row.weight_kg,
      eyeColor: row.eye_color,
      hairColor: row.hair_color,
      distinguishingMarks: [],
    },
    riskLevel: row.risk_level || "low",
    isActive: !!row.is_active,
    lastUpdated: row.updated_at,
    criminalHistory: {
      convictions: [],
      arrests: [],
      warrants: [],
    },
  };
}

export async function listCriminals(limit = 50, offset = 0) {
  const rows = await queryRows(
    `SELECT id, full_name, date_of_birth, national_id, address, phone, photo_path,
            aliases, height_cm, weight_kg, eye_color, hair_color, risk_level, is_active,
            created_at, updated_at
     FROM criminals
     ORDER BY updated_at DESC
     OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY`,
    [offset, limit]
  );
  return rows.map(toRecord);
}

export async function getCriminal(id) {
  const row = await queryRow(
    `SELECT id, full_name, date_of_birth, national_id, address, phone, photo_path,
            aliases, height_cm, weight_kg, eye_color, hair_color, risk_level, is_active,
            created_at, updated_at
     FROM criminals WHERE id = @p1`,
    [id]
  );
  return row ? toRecord(row) : null;
}

export async function createCriminal(data) {
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO criminals (id, full_name, date_of_birth, national_id, address, phone, photo_path,
                            aliases, height_cm, weight_kg, eye_color, hair_color, risk_level, is_active, created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16)`,
    [
      id,
      data.fullName,
      data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      data.nationalId ?? null,
      data.address ?? null,
      data.phone ?? null,
      data.photoPath ?? null,
      data.aliases ? data.aliases.join(", ") : null,
      data.heightCm ?? null,
      data.weightKg ?? null,
      data.eyeColor ?? null,
      data.hairColor ?? null,
      data.riskLevel ?? "low",
      data.isActive ? 1 : 0,
      now,
      now,
    ]
  );
  return await getCriminal(id);
}

export async function updateCriminal(id, updates) {
  const now = new Date();
  const mapping = {
    fullName: "full_name",
    dateOfBirth: "date_of_birth",
    nationalId: "national_id",
    photoPath: "photo_path",
    heightCm: "height_cm",
    weightKg: "weight_kg",
    eyeColor: "eye_color",
    hairColor: "hair_color",
    isActive: "is_active",
  };
  const allowed = new Set([
    "full_name",
    "date_of_birth",
    "national_id",
    "address",
    "phone",
    "photo_path",
    "aliases",
    "height_cm",
    "weight_kg",
    "eye_color",
    "hair_color",
    "risk_level",
    "is_active",
  ]);
  const set = [];
  const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === "date_of_birth") val = val ? new Date(val) : null;
      if (dbKey === "is_active") val = val ? 1 : 0;
      if (dbKey === "aliases" && Array.isArray(val)) val = val.join(", ");
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  const sql = `UPDATE criminals SET ${set.join(", ")} WHERE id = @p${params.length + 1}`;
  await queryRows(sql, params);
  return await getCriminal(id);
}

export async function deleteCriminal(id) {
  await queryRows(`DELETE FROM criminals WHERE id = @p1`, [id]);
  return true;
}
