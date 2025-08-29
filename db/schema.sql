PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crimes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  location TEXT NOT NULL,
  date_reported TEXT NOT NULL,
  date_incident TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  assigned_to TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(reported_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_crimes_status ON crimes(status);
CREATE INDEX IF NOT EXISTS idx_crimes_category ON crimes(category);
CREATE INDEX IF NOT EXISTS idx_crimes_priority ON crimes(priority);
