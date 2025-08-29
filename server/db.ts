import sql from "mssql";

let pool: sql.ConnectionPool | null = null;

function getConfig(): sql.config | null {
  const cs = process.env.DATABASE_URL;
  if (cs) return { connectionString: cs, options: { encrypt: true } } as any;
  const server = process.env.SQLSERVER_SERVER;
  const user = process.env.SQLSERVER_USER;
  const password = process.env.SQLSERVER_PASSWORD;
  const database = process.env.SQLSERVER_DATABASE;
  if (!server || !user || !password || !database) return null;
  return {
    server,
    user,
    password,
    database,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  } as sql.config;
}

export async function getPool() {
  if (pool) return pool;
  const cfg = getConfig();
  if (!cfg) throw new Error("SQL Server not configured. Set DATABASE_URL or SQLSERVER_* env vars.");
  pool = await new sql.ConnectionPool(cfg).connect();
  return pool;
}

export async function queryRows<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const p = await getPool();
  const request = p.request();
  params.forEach((val, i) => request.input(`p${i + 1}`, val));
  const result = await request.query(text);
  return result.recordset as T[];
}

export async function queryRow<T = any>(text: string, params: any[] = []): Promise<T | undefined> {
  const rows = await queryRows<T>(text, params);
  return rows[0];
}
