-- Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
  CREATE TABLE users (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    username NVARCHAR(128) NOT NULL UNIQUE,
    password NVARCHAR(256) NULL,
    role NVARCHAR(64) NOT NULL,
    full_name NVARCHAR(256) NOT NULL,
    email NVARCHAR(256) NULL,
    phone NVARCHAR(64) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Crimes base table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crimes]') AND type in (N'U'))
BEGIN
  CREATE TABLE crimes (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    title NVARCHAR(256) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(64) NOT NULL,
    status NVARCHAR(64) NOT NULL,
    priority NVARCHAR(32) NOT NULL,
    location NVARCHAR(256) NOT NULL,
    date_reported DATETIME2 NOT NULL,
    date_incident DATETIME2 NOT NULL,
    reported_by NVARCHAR(64) NOT NULL,
    assigned_to NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Incidents table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[incidents]') AND type in (N'U'))
BEGIN
  CREATE TABLE incidents (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    title NVARCHAR(256) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    incident_type NVARCHAR(64) NOT NULL,
    severity NVARCHAR(32) NOT NULL,
    location NVARCHAR(256) NOT NULL,
    date_occurred DATETIME2 NOT NULL,
    reported_by NVARCHAR(64) NOT NULL,
    reporter_name NVARCHAR(256) NOT NULL,
    status NVARCHAR(64) NOT NULL,
    follow_up_required BIT NOT NULL DEFAULT 0,
    related_case_id NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Pending accounts table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[pending_accounts]') AND type in (N'U'))
BEGIN
  CREATE TABLE pending_accounts (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    full_name NVARCHAR(256) NOT NULL,
    username NVARCHAR(128) NOT NULL,
    email NVARCHAR(256) NULL,
    phone NVARCHAR(64) NULL,
    requested_role NVARCHAR(64) NOT NULL,
    submitted_date DATETIME2 NOT NULL,
    status NVARCHAR(64) NOT NULL,
    documents NVARCHAR(MAX) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Patrol tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patrol_logs]') AND type in (N'U'))
BEGIN
  CREATE TABLE patrol_logs (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    officer_id NVARCHAR(64) NOT NULL,
    officer_name NVARCHAR(256) NULL,
    shift NVARCHAR(32) NOT NULL,
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NULL,
    route NVARCHAR(256) NOT NULL,
    area NVARCHAR(256) NOT NULL,
    status NVARCHAR(32) NOT NULL,
    notes NVARCHAR(MAX) NULL,
    mileage_start INT NULL,
    mileage_end INT NULL,
    vehicle_id NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patrol_activities]') AND type in (N'U'))
BEGIN
  CREATE TABLE patrol_activities (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    log_id NVARCHAR(64) NOT NULL,
    time DATETIME2 NOT NULL,
    activity NVARCHAR(256) NOT NULL,
    location NVARCHAR(256) NOT NULL,
    description NVARCHAR(MAX) NULL,
    type NVARCHAR(32) NOT NULL,
    created_at DATETIME2 NOT NULL
  )
END
GO

-- Failed login / audit table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[failed_login_attempts]') AND type in (N'U'))
BEGIN
  CREATE TABLE failed_login_attempts (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    username NVARCHAR(128) NULL,
    user_id NVARCHAR(64) NULL,
    ip_address NVARCHAR(64) NULL,
    country NVARCHAR(128) NULL,
    success BIT NOT NULL,
    reason NVARCHAR(256) NULL,
    attempt_time DATETIME2 NOT NULL
  )
END
GO
