-- Seed criminals if empty
IF NOT EXISTS (SELECT 1 FROM criminals)
BEGIN
  INSERT INTO criminals (id, full_name, date_of_birth, national_id, address, phone, photo_path, aliases, height_cm, weight_kg, eye_color, hair_color, risk_level, is_active, created_at, updated_at)
  VALUES
    (NEWID(), 'John Doe', '1985-03-15', 'ETH-123456789', 'Block 8, Apt 15', '+251-911-555-0101', NULL, 'Johnny D, JD', 175, 80, 'Brown', 'Black', 'medium', 1, SYSDATETIME(), SYSDATETIME()),
    (NEWID(), 'Maria Santos', '1990-07-22', 'ETH-987654321', 'Residential Block 12, Apt 7B', '+251-911-555-0202', NULL, 'Mary S', 165, 60, 'Green', 'Blonde', 'low', 0, SYSDATETIME(), SYSDATETIME());
END
GO

-- Seed assets if empty
IF NOT EXISTS (SELECT 1 FROM assets)
BEGIN
  INSERT INTO assets (id, name, category, type, description, serial_number, purchase_date, current_value, status, condition, location, created_at, updated_at)
  VALUES
    (NEWID(), 'Police Patrol Vehicle #001', 'vehicles', 'Patrol Car', 'Standard patrol vehicle equipped with radio', 'PV-2023-001', '2023-01-15', 28000, 'in_use', 'good', 'North District Station', SYSDATETIME(), SYSDATETIME()),
    (NEWID(), 'Service Pistol #SP-101', 'weapons', 'Handgun', 'Standard issue service weapon', 'SP-2023-101', '2023-03-20', 700, 'in_use', 'excellent', 'Armory', SYSDATETIME(), SYSDATETIME()),
    (NEWID(), 'Radio Communication Set #RC-05', 'communication', 'Two-Way Radio', 'Digital two-way radio with encryption', 'RC-2023-005', '2023-02-10', 350, 'available', 'good', 'Communications Room', SYSDATETIME(), SYSDATETIME());
END
GO
