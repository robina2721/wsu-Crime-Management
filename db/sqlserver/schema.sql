IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
CREATE TABLE users (
  id NVARCHAR(50) PRIMARY KEY,
  username NVARCHAR(100) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL,
  full_name NVARCHAR(200) NOT NULL,
  email NVARCHAR(200) NULL,
  phone NVARCHAR(50) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='crimes' and xtype='U')
CREATE TABLE crimes (
  id NVARCHAR(50) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX) NOT NULL,
  category NVARCHAR(50) NOT NULL,
  status NVARCHAR(50) NOT NULL,
  priority NVARCHAR(50) NOT NULL,
  location NVARCHAR(255) NOT NULL,
  date_reported DATETIME2 NOT NULL,
  date_incident DATETIME2 NOT NULL,
  reported_by NVARCHAR(50) NOT NULL,
  assigned_to NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_crimes_status')
CREATE INDEX idx_crimes_status ON crimes(status);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_crimes_category')
CREATE INDEX idx_crimes_category ON crimes(category);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_crimes_priority')
CREATE INDEX idx_crimes_priority ON crimes(priority);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_crimes_reported_by')
CREATE INDEX idx_crimes_reported_by ON crimes(reported_by);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_crimes_updated_at')
CREATE INDEX idx_crimes_updated_at ON crimes(updated_at);

-- Add foreign keys for crimes -> users
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_crimes_reported_by')
ALTER TABLE crimes ADD CONSTRAINT fk_crimes_reported_by FOREIGN KEY (reported_by) REFERENCES users(id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_crimes_assigned_to')
ALTER TABLE crimes ADD CONSTRAINT fk_crimes_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='incidents' and xtype='U')
CREATE TABLE incidents (
  id NVARCHAR(50) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX) NOT NULL,
  incident_type NVARCHAR(50) NOT NULL,
  severity NVARCHAR(50) NOT NULL,
  location NVARCHAR(255) NOT NULL,
  date_occurred DATETIME2 NOT NULL,
  reported_by NVARCHAR(50) NOT NULL,
  reporter_name NVARCHAR(200) NOT NULL,
  status NVARCHAR(50) NOT NULL,
  follow_up_required BIT NOT NULL DEFAULT 0,
  related_case_id NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pending_accounts' and xtype='U')
CREATE TABLE pending_accounts (
  id NVARCHAR(50) PRIMARY KEY,
  full_name NVARCHAR(200) NOT NULL,
  username NVARCHAR(100) NOT NULL,
  email NVARCHAR(200) NULL,
  phone NVARCHAR(50) NULL,
  requested_role NVARCHAR(50) NOT NULL,
  submitted_date DATETIME2 NOT NULL,
  status NVARCHAR(20) NOT NULL,
  documents NVARCHAR(MAX) NULL,
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'ux_pending_username')
CREATE UNIQUE INDEX ux_pending_username ON pending_accounts(username);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_incidents_status')
CREATE INDEX idx_incidents_status ON incidents(status);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_incidents_type')
CREATE INDEX idx_incidents_type ON incidents(incident_type);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_incidents_reported_by')
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'idx_users_role')
CREATE INDEX idx_users_role ON users(role);
