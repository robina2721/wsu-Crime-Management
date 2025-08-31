-- SQL Server schema for Crime Management System

-- Users
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
  CREATE TABLE users (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    username NVARCHAR(128) NOT NULL UNIQUE,
    password NVARCHAR(200) NULL,
    role NVARCHAR(64) NOT NULL,
    full_name NVARCHAR(256) NOT NULL,
    email NVARCHAR(256) NULL,
    phone NVARCHAR(64) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END

-- Pending Accounts
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
    status NVARCHAR(32) NOT NULL,
    documents NVARCHAR(MAX) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END

-- Crimes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crimes]') AND type in (N'U'))
BEGIN
  CREATE TABLE crimes (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    title NVARCHAR(256) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(64) NOT NULL,
    status NVARCHAR(64) NOT NULL,
    priority NVARCHAR(32) NOT NULL,
    location NVARCHAR(512) NOT NULL,
    date_reported DATETIME2 NOT NULL,
    date_incident DATETIME2 NOT NULL,
    reported_by NVARCHAR(64) NOT NULL,
    assigned_to NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_crimes_reported_by ON crimes(reported_by);
  CREATE INDEX IX_crimes_assigned_to ON crimes(assigned_to);
  CREATE INDEX IX_crimes_status ON crimes(status);
END

-- Crime Evidence
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_evidence]') AND type in (N'U'))
BEGIN
  CREATE TABLE crime_evidence (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    crime_id NVARCHAR(64) NOT NULL,
    file_name NVARCHAR(512) NOT NULL,
    file_type NVARCHAR(128) NULL,
    description NVARCHAR(1024) NULL,
    uploaded_by NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_crime_evidence_crime_id ON crime_evidence(crime_id);
END

-- Crime Witnesses
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_witnesses]') AND type in (N'U'))
BEGIN
  CREATE TABLE crime_witnesses (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    crime_id NVARCHAR(64) NOT NULL,
    name NVARCHAR(256) NOT NULL,
    phone NVARCHAR(64) NULL,
    email NVARCHAR(256) NULL,
    statement NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_crime_witnesses_crime_id ON crime_witnesses(crime_id);
END

-- Crime Status Updates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_status_updates]') AND type in (N'U'))
BEGIN
  CREATE TABLE crime_status_updates (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    crime_id NVARCHAR(64) NOT NULL,
    status NVARCHAR(64) NOT NULL,
    notes NVARCHAR(MAX) NULL,
    updated_by NVARCHAR(64) NOT NULL,
    is_visible_to_citizen BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_crime_status_updates_crime_id ON crime_status_updates(crime_id);
END

-- Crime Messages (citizen <-> officer)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_messages]') AND type in (N'U'))
BEGIN
  CREATE TABLE crime_messages (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    crime_id NVARCHAR(64) NOT NULL,
    sender_id NVARCHAR(64) NOT NULL,
    sender_role NVARCHAR(64) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_crime_messages_crime_id ON crime_messages(crime_id);
END

-- Assets
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[assets]') AND type in (N'U'))
BEGIN
  CREATE TABLE assets (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    name NVARCHAR(256) NOT NULL,
    category NVARCHAR(128) NOT NULL,
    type NVARCHAR(128) NOT NULL,
    description NVARCHAR(MAX) NULL,
    serial_number NVARCHAR(128) NULL,
    purchase_date DATETIME2 NULL,
    current_value DECIMAL(18,2) NULL,
    status NVARCHAR(64) NOT NULL,
    condition NVARCHAR(64) NOT NULL,
    location NVARCHAR(256) NULL,
    assigned_to NVARCHAR(64) NULL,
    assigned_to_name NVARCHAR(256) NULL,
    next_maintenance DATETIME2 NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END

-- Incidents
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[incidents]') AND type in (N'U'))
BEGIN
  CREATE TABLE incidents (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    title NVARCHAR(256) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    incident_type NVARCHAR(64) NOT NULL,
    severity NVARCHAR(32) NOT NULL,
    location NVARCHAR(512) NOT NULL,
    date_occurred DATETIME2 NOT NULL,
    reported_by NVARCHAR(64) NOT NULL,
    reporter_name NVARCHAR(256) NOT NULL,
    status NVARCHAR(64) NOT NULL,
    follow_up_required BIT NOT NULL DEFAULT 0,
    related_case_id NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END

-- Criminals
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminals]') AND type in (N'U'))
BEGIN
  CREATE TABLE criminals (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    full_name NVARCHAR(256) NOT NULL,
    date_of_birth DATETIME2 NULL,
    national_id NVARCHAR(64) NULL,
    address NVARCHAR(512) NULL,
    phone NVARCHAR(64) NULL,
    photo_path NVARCHAR(512) NULL,
    aliases NVARCHAR(512) NULL,
    height_cm INT NULL,
    weight_kg INT NULL,
    eye_color NVARCHAR(64) NULL,
    hair_color NVARCHAR(64) NULL,
    risk_level NVARCHAR(32) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END

-- Citizen Feedback
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[citizen_feedback]') AND type in (N'U'))
BEGIN
  CREATE TABLE citizen_feedback (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    citizen_id NVARCHAR(64) NOT NULL,
    citizen_name NVARCHAR(256) NULL,
    email NVARCHAR(256) NULL,
    phone NVARCHAR(64) NULL,
    feedback_type NVARCHAR(64) NOT NULL,
    category NVARCHAR(64) NOT NULL,
    subject NVARCHAR(256) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    related_case_id NVARCHAR(64) NULL,
    priority NVARCHAR(32) NOT NULL,
    status NVARCHAR(64) NOT NULL,
    response NVARCHAR(MAX) NULL,
    responded_by_id NVARCHAR(64) NULL,
    responded_by_name NVARCHAR(256) NULL,
    responded_at DATETIME2 NULL,
    is_anonymous BIT NOT NULL DEFAULT 0,
    submitted_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_feedback_status ON citizen_feedback(status);
END

-- User Photos (base64)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_photos]') AND type in (N'U'))
BEGIN
  CREATE TABLE user_photos (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    user_id NVARCHAR(64) NOT NULL,
    mime NVARCHAR(128) NOT NULL,
    data_base64 NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL
  );
  CREATE INDEX IX_user_photos_user_id ON user_photos(user_id);
END
