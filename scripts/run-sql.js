const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Set it and re-run: pnpm db:setup');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function execSQL(file) {
  const sql = fs.readFileSync(file, 'utf8');
  await pool.query(sql);
}

(async () => {
  try {
    const schemaPath = path.join(process.cwd(), 'db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      await execSQL(schemaPath);
      console.log('Applied schema.sql');
    }
    const seedPath = path.join(process.cwd(), 'db/seed.sql');
    if (fs.existsSync(seedPath)) {
      await execSQL(seedPath);
      console.log('Applied seed.sql');
    }
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
