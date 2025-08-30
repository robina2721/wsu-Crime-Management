IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'criminals')
BEGIN
  CREATE TABLE criminals (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    date_of_birth DATETIME2 NULL,
    national_id NVARCHAR(100) NULL,
    address NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    photo_path NVARCHAR(255) NULL,
    aliases NVARCHAR(MAX) NULL,
    height_cm INT NULL,
    weight_kg INT NULL,
    eye_color NVARCHAR(50) NULL,
    hair_color NVARCHAR(50) NULL,
    risk_level NVARCHAR(20) NOT NULL DEFAULT 'low',
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'assets')
BEGIN
  CREATE TABLE assets (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    type NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    serial_number NVARCHAR(100) NULL,
    purchase_date DATETIME2 NULL,
    current_value DECIMAL(18,2) NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT 'available',
    condition NVARCHAR(50) NOT NULL DEFAULT 'good',
    location NVARCHAR(255) NULL,
    assigned_to NVARCHAR(36) NULL,
    assigned_to_name NVARCHAR(255) NULL,
    next_maintenance DATETIME2 NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
  );
END
GO
