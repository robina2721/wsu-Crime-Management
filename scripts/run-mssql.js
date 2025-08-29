const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const connectionString = process.env.SQLSERVER_CONNECTION_STRING || process.env.DATABASE_URL;

async function getPool() {
  if (!connectionString) {
    const server = process.env.SQLSERVER_SERVER;
    const user = process.env.SQLSERVER_USER;
    const password = process.env.SQLSERVER_PASSWORD;
    const database = process.env.SQLSERVER_DATABASE;
    if (!server || !user || !password || !database) {
      console.error('Set SQLSERVER_* env vars or SQLSERVER_CONNECTION_STRING/DATABASE_URL');
      process.exit(1);
    }
    return sql.connect({ server, user, password, database, options: { encrypt: true, trustServerCertificate: true } });
  }
  return sql.connect({ connectionString, options: { encrypt: true, trustServerCertificate: true } });
}

async function execSQL(file) {
  const sqlText = fs.readFileSync(file, 'utf8');
  await sql.query(sqlText);
}

(async () => {
  try {
    await getPool();
    const schemaPath = path.join(process.cwd(), 'db/sqlserver/schema.sql');
    if (fs.existsSync(schemaPath)) {
      await execSQL(schemaPath);
      console.log('Applied SQL Server schema.sql');
    }
    const seedPath = path.join(process.cwd(), 'db/sqlserver/seed.sql');
    if (fs.existsSync(seedPath)) {
      await execSQL(seedPath);
      console.log('Applied SQL Server seed.sql');
    }
    await sql.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
