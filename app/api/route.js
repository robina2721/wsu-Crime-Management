import { NextResponse } from "next/server";

export async function GET() {
  const dbConfigured = !!(process.env.DATABASE_URL || process.env.SQLSERVER_CONNECTION_STRING || (process.env.SQLSERVER_SERVER && process.env.SQLSERVER_USER && process.env.SQLSERVER_PASSWORD && process.env.SQLSERVER_DATABASE));
  return NextResponse.json({
    name: "Wolaita Sodo City Security Portal",
    status: "ok",
    time: new Date().toISOString(),
    databaseConfigured: dbConfigured
  });
}
