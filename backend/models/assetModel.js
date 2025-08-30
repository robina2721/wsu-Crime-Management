import { queryRow, queryRows } from "../../backend/db.js";

export async function listAssets(limit = 50, offset = 0) {
  const rows = await queryRows(
    `SELECT id, name, category, type, description, serial_number AS serialNumber,
            purchase_date AS purchaseDate, current_value AS currentValue, status, condition,
            location, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
            next_maintenance AS nextMaintenance, created_at AS createdAt, updated_at AS updatedAt
     FROM assets
     ORDER BY created_at DESC
     OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY`,
    [offset, limit]
  );
  return rows;
}

export async function getAsset(id) {
  return await queryRow(
    `SELECT id, name, category, type, description, serial_number AS serialNumber,
            purchase_date AS purchaseDate, current_value AS currentValue, status, condition,
            location, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
            next_maintenance AS nextMaintenance, created_at AS createdAt, updated_at AS updatedAt
     FROM assets WHERE id = @p1`,
    [id]
  );
}

export async function createAsset(data) {
  const id =
    global.crypto?.randomUUID?.() || (await import("node:crypto")).randomUUID();
  const now = new Date();
  await queryRows(
    `INSERT INTO assets (id, name, category, type, description, serial_number, purchase_date, current_value,
                         status, condition, location, assigned_to, assigned_to_name, next_maintenance,
                         created_at, updated_at)
     VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16)`,
    [
      id,
      data.name,
      data.category,
      data.type,
      data.description ?? null,
      data.serialNumber ?? null,
      data.purchaseDate ? new Date(data.purchaseDate) : null,
      data.currentValue ?? 0,
      data.status ?? "available",
      data.condition ?? "good",
      data.location ?? null,
      data.assignedTo ?? null,
      data.assignedToName ?? null,
      data.nextMaintenance ? new Date(data.nextMaintenance) : null,
      now,
      now,
    ]
  );
  return await getAsset(id);
}

export async function updateAsset(id, updates) {
  const now = new Date();
  const mapping = {
    serialNumber: "serial_number",
    purchaseDate: "purchase_date",
    currentValue: "current_value",
    assignedTo: "assigned_to",
    assignedToName: "assigned_to_name",
    nextMaintenance: "next_maintenance",
  };
  const allowed = new Set([
    "name",
    "category",
    "type",
    "description",
    "serial_number",
    "purchase_date",
    "current_value",
    "status",
    "condition",
    "location",
    "assigned_to",
    "assigned_to_name",
    "next_maintenance",
  ]);
  const set = [];
  const params = [];
  for (const key of Object.keys(updates)) {
    const dbKey = mapping[key] ?? key;
    if (allowed.has(dbKey)) {
      let val = updates[key];
      if (dbKey === "purchase_date" || dbKey === "next_maintenance") val = val ? new Date(val) : null;
      set.push(`${dbKey} = @p${params.length + 1}`);
      params.push(val);
    }
  }
  set.push(`updated_at = @p${params.length + 1}`);
  params.push(now);
  params.push(id);
  const sql = `UPDATE assets SET ${set.join(", ")} WHERE id = @p${params.length + 1}`;
  await queryRows(sql, params);
  return await getAsset(id);
}

export async function deleteAsset(id) {
  await queryRows(`DELETE FROM assets WHERE id = @p1`, [id]);
  return true;
}
