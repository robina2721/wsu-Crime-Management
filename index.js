export function getBackendStatus() {
  const dbConfigured = !!(process.env.DATABASE_URL || process.env.SQLSERVER_CONNECTION_STRING || (process.env.SQLSERVER_SERVER && process.env.SQLSERVER_USER && process.env.SQLSERVER_PASSWORD && process.env.SQLSERVER_DATABASE));
  return {
    framework: "nextjs",
    apiBase: "/api",
    databaseConfigured: dbConfigured,
    timestamp: new Date().toISOString()
  };
}
