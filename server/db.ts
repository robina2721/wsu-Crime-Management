import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not set. Please configure a Postgres database.");
}

export const pool = new Pool({ connectionString });

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const res = await pool.query(sql, params);
  return (res.rows[0] as T) || undefined;
}
