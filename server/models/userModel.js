import { queryRow } from "../db.js";

export async function findUserByUsername(username) {
  return await queryRow(
    `SELECT TOP 1 id, username, password, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as updatedAt
     FROM users WHERE username = @p1`,
    [username]
  );
}

export async function findUserById(id) {
  return await queryRow(
    `SELECT TOP 1 id, username, password, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as updatedAt
     FROM users WHERE id = @p1`,
    [id]
  );
}
