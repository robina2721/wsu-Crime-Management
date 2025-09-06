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

-- Seed officers
IF NOT EXISTS (SELECT 1 FROM officers)
BEGIN
  INSERT INTO officers (id, employee_id, full_name, date_of_birth, national_id, address, phone, email, emergency_contact, badge_number, rank, department, start_date, status, supervisor, specializations, certifications, photo, created_by, created_at, updated_at)
  VALUES
  ('4','EMP-004','Officer Mulugeta Kebede', NULL, NULL, NULL, NULL, 'mulugeta@example.com', NULL, 'BADGE-004', 'Officer', 'Patrol', DATEADD(year,-5,@now), 'active', NULL, NULL, NULL, NULL, '1', @now, @now),
  ('5','EMP-005','Detective Abel Tadesse', NULL, NULL, NULL, NULL, 'abel@example.com', NULL, 'BADGE-005', 'Detective', 'Investigations', DATEADD(year,-3,@now), 'active', NULL, NULL, NULL, NULL, '1', @now, @now);
END
GO

-- Seed staff assignments
IF NOT EXISTS (SELECT 1 FROM staff_assignments)
BEGIN
  INSERT INTO staff_assignments (id, officer_id, officer_name, assignment, location, start_time, end_time, status, priority, created_at, updated_at)
  VALUES
  ('SA-001','4','Officer Mulugeta Kebede','Patrol Assignment','Downtown', DATEADD(day,-1,@now), DATEADD(day,1,@now), 'active', 'medium', @now, @now);
END
GO

-- Seed HR reports
IF NOT EXISTS (SELECT 1 FROM hr_reports)
BEGIN
  INSERT INTO hr_reports (id, type, title, description, parameters, generated_by, generated_at, file_url, status, created_at, updated_at)
  VALUES
  ('HR-001','staff_summary','Monthly Staff Summary','Auto-generated staff report',NULL,'1',@now,NULL,'generated',@now,@now);
END
GO

-- Seed staff schedules
IF NOT EXISTS (SELECT 1 FROM staff_schedules)
BEGIN
  INSERT INTO staff_schedules (id, officer_id, officer_name, shift, start_date, end_date, assignment, status, notes, created_by, created_at, updated_at)
  VALUES
  ('SS-001','4','Officer Mulugeta Kebede','morning', DATEADD(day,0,@now), DATEADD(day,1,@now), NULL, 'scheduled', 'Morning shift', '1', @now, @now);
END
GO

-- Seed citizen feedback
IF NOT EXISTS (SELECT 1 FROM citizen_feedback)
BEGIN
  INSERT INTO citizen_feedback (id, citizen_id, citizen_name, email, phone, feedback_type, category, subject, message, related_case_id, priority, status, response, responded_by_id, responded_by_name, responded_at, is_anonymous, submitted_at, updated_at)
  VALUES
  ('CF-001', '6', 'Mekbib Yohannes', 'mekbib@example.com', NULL, 'complaint', 'service', 'Slow response', 'I experienced a slow response time from patrols.', NULL, 'medium', 'submitted', NULL, NULL, NULL, NULL, 0, @now, @now);
END
GO

-- Seed criminal history (example)
IF NOT EXISTS (SELECT 1 FROM criminal_convictions)
BEGIN
  INSERT INTO criminal_convictions (id, criminal_id, crime_type, description, date, sentence, court, case_number, created_at, updated_at)
  VALUES
  ('CV-001','CR-001','theft','Stolen bicycle case', DATEADD(year,-1,@now), '6 months', 'City Court', 'CASE-001', @now, @now);
END
GO

IF NOT EXISTS (SELECT 1 FROM criminal_arrests)
BEGIN
  INSERT INTO criminal_arrests (id, criminal_id, date, disposition, charges, arresting_officer, location, notes, created_at, updated_at)
  VALUES
  ('AR-001','CR-001', DATEADD(year,-1,@now), 'released', 'theft', 'Officer Mulugeta Kebede', 'Market Street', NULL, @now, @now);
END
GO

IF NOT EXISTS (SELECT 1 FROM criminal_warrants)
BEGIN
  INSERT INTO criminal_warrants (id, criminal_id, type, issue_date, expiry_date, issuing_court, status, charges, created_at, updated_at)
  VALUES
  ('WR-001','CR-002','arrest', DATEADD(month,-6,@now), DATEADD(month,6,@now), 'City Court', 'active', 'burglary', @now, @now);
END
GO

-- Seed crime auxiliary data
IF NOT EXISTS (SELECT 1 FROM crime_evidence)
BEGIN
  INSERT INTO crime_evidence (id, crime_id, file_name, file_type, description, uploaded_by, created_at)
  VALUES
  ('CE-001','CR-001','bike_photo.jpg','image/jpeg','Photo of the stolen bicycle','4',@now);
END
GO

IF NOT EXISTS (SELECT 1 FROM crime_witnesses)
BEGIN
  INSERT INTO crime_witnesses (id, crime_id, name, phone, email, statement, created_at)
  VALUES
  ('CW-001','CR-001','Witness One','0900000001',NULL,'Saw suspicious person near the market',@now);
END
GO

IF NOT EXISTS (SELECT 1 FROM crime_messages)
BEGIN
  INSERT INTO crime_messages (id, crime_id, sender_id, sender_role, message, created_at)
  VALUES
  ('CM-001','CR-001','4','preventive_officer','Initial report logged',@now);
END
GO

IF NOT EXISTS (SELECT 1 FROM crime_message_attachments)
BEGIN
  INSERT INTO crime_message_attachments (id, message_id, crime_id, file_name, file_type, created_at)
  VALUES
  ('CMA-001','CM-001','CR-001','evidence_doc.pdf','application/pdf',@now);
END
GO

-- Seed user photos
IF NOT EXISTS (SELECT 1 FROM user_photos)
BEGIN
  INSERT INTO user_photos (id, user_id, mime, data_base64, created_at)
  VALUES
  ('UP-001','4','image/png','',@now);
END
GO
