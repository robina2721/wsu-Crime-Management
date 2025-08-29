import { get } from "../db";
import { User } from "@shared/types";

export async function findUserByUsername(username: string) {
  const row = await get<any>(
    `SELECT id, username, password, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as updatedAt
     FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return row as (User & { password: string }) | undefined;
}

export async function findUserById(id: string) {
  const row = await get<any>(
    `SELECT id, username, password, role, full_name as fullName, email, phone, is_active as isActive, created_at as createdAt, updated_at as updatedAt
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return row as (User & { password: string }) | undefined;
}
