import sql from "mssql";

let pool = null;

function getConfig() {
  const cs = process.env.DATABASE_URL || process.env.SQLSERVER_CONNECTION_STRING;
  if (cs) return { connectionString: cs, options: { encrypt: true, trustServerCertificate: true } };
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
    options: { encrypt: true, trustServerCertificate: true },
  };
}

export async function getPool() {
  if (pool) return pool;
  const cfg = getConfig();
  if (!cfg) throw new Error("SQL Server not configured. Set SQLSERVER_* or DATABASE_URL");
  pool = await new sql.ConnectionPool(cfg).connect();
  return pool;
}

export async function queryRows(text, params = []) {
  const p = await getPool();
  const request = p.request();
  params.forEach((val, i) => request.input(`p${i + 1}`, val));
  const result = await request.query(text);
  return result.recordset;
}

export async function queryRow(text, params = []) {
  const rows = await queryRows(text, params);
  return rows[0];
}
