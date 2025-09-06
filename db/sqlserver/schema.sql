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
    reported_by NVARCHAR(64) NULL,
    reporter_name NVARCHAR(256) NULL,
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

-- Officers table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[officers]') AND type in (N'U'))
BEGIN
  CREATE TABLE officers (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    employee_id NVARCHAR(64) NOT NULL,
    full_name NVARCHAR(256) NULL,
    date_of_birth DATETIME2 NULL,
    national_id NVARCHAR(128) NULL,
    address NVARCHAR(512) NULL,
    phone NVARCHAR(64) NULL,
    email NVARCHAR(128) NULL,
    emergency_contact NVARCHAR(MAX) NULL,
    badge_number NVARCHAR(64) NULL,
    rank NVARCHAR(64) NULL,
    department NVARCHAR(128) NULL,
    start_date DATETIME2 NULL,
    status NVARCHAR(64) NULL,
    supervisor NVARCHAR(128) NULL,
    specializations NVARCHAR(MAX) NULL,
    certifications NVARCHAR(MAX) NULL,
    photo NVARCHAR(1024) NULL,
    created_by NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Staff assignments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[staff_assignments]') AND type in (N'U'))
BEGIN
  CREATE TABLE staff_assignments (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    officer_id NVARCHAR(64) NOT NULL,
    officer_name NVARCHAR(128) NULL,
    assignment NVARCHAR(256) NOT NULL,
    location NVARCHAR(128) NULL,
    start_time DATETIME2 NULL,
    end_time DATETIME2 NULL,
    status NVARCHAR(32) NOT NULL,
    priority NVARCHAR(32) NOT NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- HR reports
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hr_reports]') AND type in (N'U'))
BEGIN
  CREATE TABLE hr_reports (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    type NVARCHAR(64) NOT NULL,
    title NVARCHAR(256) NOT NULL,
    description NVARCHAR(1024) NULL,
    parameters NVARCHAR(MAX) NULL,
    generated_by NVARCHAR(64) NULL,
    generated_at DATETIME2 NULL,
    file_url NVARCHAR(1024) NULL,
    status NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Staff schedules
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[staff_schedules]') AND type in (N'U'))
BEGIN
  CREATE TABLE staff_schedules (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    officer_id NVARCHAR(64) NOT NULL,
    officer_name NVARCHAR(128) NULL,
    shift NVARCHAR(64) NULL,
    start_date DATETIME2 NULL,
    end_date DATETIME2 NULL,
    assignment NVARCHAR(MAX) NULL,
    status NVARCHAR(64) NULL,
    notes NVARCHAR(1024) NULL,
    created_by NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Citizen feedback
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
  )
END
GO

-- Criminal history tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminal_convictions]') AND type in (N'U'))
BEGIN
  CREATE TABLE criminal_convictions (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    criminal_id NVARCHAR(64) NOT NULL,
    crime_type NVARCHAR(64) NULL,
    description NVARCHAR(512) NULL,
    date DATETIME2 NULL,
    sentence NVARCHAR(256) NULL,
    court NVARCHAR(128) NULL,
    case_number NVARCHAR(64) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminal_arrests]') AND type in (N'U'))
BEGIN
  CREATE TABLE criminal_arrests (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    criminal_id NVARCHAR(64) NOT NULL,
    date DATETIME2 NULL,
    disposition NVARCHAR(64) NULL,
    charges NVARCHAR(MAX) NULL,
    arresting_officer NVARCHAR(128) NULL,
    location NVARCHAR(128) NULL,
    notes NVARCHAR(512) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminal_warrants]') AND type in (N'U'))
BEGIN
  CREATE TABLE criminal_warrants (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    criminal_id NVARCHAR(64) NOT NULL,
    type NVARCHAR(32) NULL,
    issue_date DATETIME2 NULL,
    expiry_date DATETIME2 NULL,
    issuing_court NVARCHAR(128) NULL,
    status NVARCHAR(32) NULL,
    charges NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Crime related auxiliary tables
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
  )
END
GO

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
  )
END
GO

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
  )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_messages]') AND type in (N'U'))
BEGIN
  CREATE TABLE crime_messages (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    crime_id NVARCHAR(64) NOT NULL,
    sender_id NVARCHAR(64) NOT NULL,
    sender_role NVARCHAR(64) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL
  )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crime_message_attachments]') AND type in (N'U'))
BEGIN
  CREATE TABLE crime_message_attachments (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    message_id NVARCHAR(64) NOT NULL,
    crime_id NVARCHAR(64) NOT NULL,
    file_name NVARCHAR(512) NOT NULL,
    file_type NVARCHAR(128) NULL,
    created_at DATETIME2 NOT NULL
  )
END
GO

-- User photos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_photos]') AND type in (N'U'))
BEGIN
  CREATE TABLE user_photos (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    user_id NVARCHAR(64) NOT NULL,
    mime NVARCHAR(128) NOT NULL,
    data_base64 NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL
  )
END
GO
-- Assets table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[assets]') AND type in (N'U'))
BEGIN
  CREATE TABLE assets (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    name NVARCHAR(256) NOT NULL,
    category NVARCHAR(128) NULL,
    type NVARCHAR(128) NULL,
    description NVARCHAR(MAX) NULL,
    serial_number NVARCHAR(128) NULL,
    purchase_date DATETIME2 NULL,
    current_value DECIMAL(18,2) NULL,
    status NVARCHAR(64) NULL,
    condition NVARCHAR(64) NULL,
    location NVARCHAR(256) NULL,
    assigned_to NVARCHAR(64) NULL,
    assigned_to_name NVARCHAR(256) NULL,
    next_maintenance DATETIME2 NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO

-- Criminals table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[criminals]') AND type in (N'U'))
BEGIN
  CREATE TABLE criminals (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    full_name NVARCHAR(256) NOT NULL,
    date_of_birth DATETIME2 NULL,
    national_id NVARCHAR(128) NULL,
    address NVARCHAR(512) NULL,
    phone NVARCHAR(64) NULL,
    photo_path NVARCHAR(1024) NULL,
    aliases NVARCHAR(MAX) NULL,
    height_cm INT NULL,
    weight_kg INT NULL,
    eye_color NVARCHAR(64) NULL,
    hair_color NVARCHAR(64) NULL,
    risk_level NVARCHAR(32) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  )
END
GO
-- done
