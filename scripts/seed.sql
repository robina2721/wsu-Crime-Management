-- Seed data for Crime Management System (SQL Server)

-- Users
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES
  ('1','superadmin','admin123','super_admin','System Administrator','admin@example.com','+251-900-000-001',1, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('2','police_head','head123','police_head','Chief Inspector Dawit Tadesse','chief@wolaita-sodo.gov.et','+251-900-000-002',1, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('3','hr_manager','hr123','hr_manager','HR Manager Selam Mulu','hr@wolaita-sodo.gov.et','+251-900-000-003',1, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('4','detective','detective123','detective_officer','Detective Sara Alemayehu','detective@wolaita-sodo.gov.et','+251-900-000-004',1, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('5','officer','officer123','preventive_officer','Officer Mulugeta Kebede','officer@wolaita-sodo.gov.et','+251-900-000-005',1, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('6','citizen','citizen123','citizen','John Citizen','citizen@example.com','+251-900-000-006',1, SYSUTCDATETIME(), SYSUTCDATETIME());

-- Pending Accounts
INSERT INTO pending_accounts (id, full_name, username, email, phone, requested_role, submitted_date, status, documents, notes, created_at, updated_at)
VALUES
  ('P1','Officer Candidate Bereket Haile','bereket_h','bereket.haile@example.com','+251-911-000-100','preventive_officer', SYSUTCDATETIME(), 'pending', 'police_certificate.pdf,training_completion.pdf', 'Recent police academy graduate with high scores', SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('P2','Detective Trainee Meron Gebre','meron_g','meron.gebre@example.com','+251-911-000-101','detective_officer', SYSUTCDATETIME(), 'pending', 'detective_certification.pdf,background_check.pdf', 'Specialized in cybercrime investigation', SYSUTCDATETIME(), SYSUTCDATETIME());

-- Crimes
INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
VALUES
  ('CR-001','Mobile Phone Theft','Phone stolen at market area','theft','reported','medium','Market Street', SYSUTCDATETIME(), DATEADD(day,-1,SYSUTCDATETIME()), '6', '4', SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('CR-002','Vandalism at Park','Graffiti reported on public property','vandalism','under_investigation','low','City Park', SYSUTCDATETIME(), DATEADD(day,-2,SYSUTCDATETIME()), '6', '5', SYSUTCDATETIME(), SYSUTCDATETIME());

-- Crime Evidence
INSERT INTO crime_evidence (id, crime_id, file_name, file_type, description, uploaded_by, created_at)
VALUES
  ('E1','CR-001','photo1.jpg','image/jpeg','Photo of the scene','4', SYSUTCDATETIME());

-- Crime Witnesses
INSERT INTO crime_witnesses (id, crime_id, name, phone, email, statement, created_at)
VALUES
  ('W1','CR-001','Kebede Alemu','+251-911-222-333','kebede@example.com','Saw suspect running towards north', SYSUTCDATETIME());

-- Crime Status Updates
INSERT INTO crime_status_updates (id, crime_id, status, notes, updated_by, is_visible_to_citizen, created_at)
VALUES
  ('SU1','CR-001','reported','Report submitted by citizen','6',1, SYSUTCDATETIME()),
  ('SU2','CR-001','assigned','Assigned to Detective Sara','2',1, SYSUTCDATETIME());

-- Crime Messages
INSERT INTO crime_messages (id, crime_id, sender_id, sender_role, message, created_at)
VALUES
  ('M1','CR-001','6','citizen','Please keep me updated.', SYSUTCDATETIME()),
  ('M2','CR-001','4','detective_officer','We are reviewing CCTV footage.', SYSUTCDATETIME());

-- Incidents
INSERT INTO incidents (id, title, description, incident_type, severity, location, date_occurred, reported_by, reporter_name, status, follow_up_required, related_case_id, created_at, updated_at)
VALUES
  ('IN-001','Traffic Accident','Minor collision at roundabout','traffic_incident','medium','Main Roundabout', DATEADD(hour,-6,SYSUTCDATETIME()), '5', 'Officer Mulugeta Kebede', 'reported', 0, NULL, SYSUTCDATETIME(), SYSUTCDATETIME());

-- Assets
INSERT INTO assets (id, name, category, type, description, serial_number, purchase_date, current_value, status, condition, location, assigned_to, assigned_to_name, next_maintenance, created_at, updated_at)
VALUES
  ('A-001','Patrol Car #12','vehicle','car','Sedan patrol unit','VIN123456', DATEADD(year,-2,SYSUTCDATETIME()), 12000, 'in_use','good','Station Garage','5','Officer Mulugeta Kebede', DATEADD(month,6,SYSUTCDATETIME()), SYSUTCDATETIME(), SYSUTCDATETIME());

-- Criminals
INSERT INTO criminals (id, full_name, date_of_birth, national_id, address, phone, photo_path, aliases, height_cm, weight_kg, eye_color, hair_color, risk_level, is_active, created_at, updated_at)
VALUES
  ('CRIM-001','Abel Tadesse','1990-05-20','ETH-123456','Wolaita Sodo','+251-911-777-888', NULL, 'AT, Abe', 178, 75, 'brown', 'black', 'medium', 1, SYSUTCDATETIME(), SYSUTCDATETIME());

-- Citizen Feedback
INSERT INTO citizen_feedback (id, citizen_id, citizen_name, email, phone, feedback_type, category, subject, message, related_case_id, priority, status, response, responded_by_id, responded_by_name, responded_at, is_anonymous, submitted_at, updated_at)
VALUES
  ('FB-001','6','John Citizen','citizen@example.com','+251-900-000-006','compliment','officer_conduct','Great Service','Officer was very helpful and professional.', NULL, 'low', 'resolved', 'Thank you for your feedback.', '2', 'Chief Inspector Dawit Tadesse', SYSUTCDATETIME(), 0, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('FB-002','6','Anonymous', NULL, NULL,'complaint','response_time','Slow Response','Waited 45 minutes for response.', NULL, 'high', 'under_review', NULL, NULL, NULL, NULL, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

-- User Photos (optional sample)
-- Note: data_base64 omitted for brevity; upload via API after seed
