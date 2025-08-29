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
