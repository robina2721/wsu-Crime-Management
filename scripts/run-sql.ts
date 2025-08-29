import fs from "fs";
import path from "path";
import { pool } from "../server/db";

async function execSQL(file: string) {
  const sql = fs.readFileSync(file, "utf8");
  await pool.query(sql);
}

(async () => {
  try {
    const schemaPath = path.join(process.cwd(), "db/schema.sql");
    if (fs.existsSync(schemaPath)) {
      await execSQL(schemaPath);
      console.log("Applied schema.sql");
    }
    const seedPath = path.join(process.cwd(), "db/seed.sql");
    if (fs.existsSync(seedPath)) {
      await execSQL(seedPath);
      console.log("Applied seed.sql");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
