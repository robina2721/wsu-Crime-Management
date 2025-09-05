-- Seed users
DECLARE @now DATETIME2 = SYSDATETIME();
IF NOT EXISTS (SELECT 1 FROM users)
BEGIN
  INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at) VALUES
  ('1','admin','admin123','super_admin','System Admin','admin@example.com',NULL,1,@now,@now),
  ('2','chief','chief123','police_head','Police Chief','chief@example.com',NULL,1,@now,@now),
  ('3','hr','hr123','hr_manager','HR Manager','hr@example.com',NULL,1,@now,@now),
  ('4','officer_mulugeta','officer123','preventive_officer','Officer Mulugeta Kebede','mulugeta@example.com',NULL,1,@now,@now),
  ('5','detective_abel','detective123','detective_officer','Detective Abel Tadesse','abel@example.com',NULL,1,@now,@now),
  ('6','mekbib','password','citizen','Mekbib Yohannes','mekbib@example.com',NULL,1,@now,@now);
END
GO

-- Seed crimes
IF NOT EXISTS (SELECT 1 FROM crimes)
BEGIN
  INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at) VALUES
  ('CR-001','Stolen Bicycle','Bicycle stolen near market','theft','reported','medium','Market Street', DATEADD(day,-2,@now), DATEADD(day,-2,@now), '6','4', @now, @now),
  ('CR-002','Burglary at Residence','Break-in reported','burglary','assigned','high','North District', DATEADD(day,-1,@now), DATEADD(day,-1,@now), '6','5', @now, @now);
END
GO

-- Seed incidents
IF NOT EXISTS (SELECT 1 FROM incidents)
BEGIN
  INSERT INTO incidents (id, title, description, incident_type, severity, location, date_occurred, reported_by, reporter_name, status, follow_up_required, related_case_id, created_at, updated_at) VALUES
  ('INC-001','Suspicious Vehicle','Black sedan loitering','suspicious_activity','low','Market Street', DATEADD(day,-2,@now), '4', 'Officer Mulugeta Kebede', 'reported', 0, 'CR-001', @now, @now),
  ('INC-002','Noise Complaint','Loud music at night','public_disturbance','low','Residential Block 5', DATEADD(day,-1,@now), '4', 'Officer Mulugeta Kebede', 'reported', 0, NULL, @now, @now);
END
GO

-- Seed example patrol
IF NOT EXISTS (SELECT 1 FROM patrol_logs)
BEGIN
  INSERT INTO patrol_logs (id, officer_id, officer_name, shift, start_time, end_time, route, area, status, notes, mileage_start, mileage_end, vehicle_id, created_at, updated_at)
  VALUES ('PL-001','4','Officer Mulugeta Kebede','morning', DATEADD(hour,-8,@now), DATEADD(hour,-0,@now), 'Downtown-Market-North District','Central Business District','completed','Routine patrol completed.', 45230, 45298, 'PV-001', @now, @now);
  INSERT INTO patrol_activities (id, log_id, time, activity, location, description, type, created_at) VALUES
    ('PA-001','PL-001', DATEADD(hour,-7,@now), 'Started patrol route','Police Station', NULL, 'patrol', @now),
    ('PA-002','PL-001', DATEADD(hour,-6,@now), 'Checkpoint setup','Main Street & 1st Ave','Traffic checkpoint for morning rush hour','checkpoint', @now),
    ('PA-003','PL-001', DATEADD(hour,-4,@now), 'Coffee break','Patrol Unit', NULL, 'break', @now),
    ('PA-004','PL-001', DATEADD(hour,-2,@now), 'Incident response','Market Street','Responded to suspicious vehicle report','response', @now);
END
GO
