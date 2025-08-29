IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES
  ('1', 'admin', 'admin123', 'super_admin', 'System Administrator', 'admin@wolaita-sodo.gov.et', '+251-911-000-001', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'police_head')
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES ('2', 'police_head', 'police123', 'police_head', 'Chief Inspector Dawit Tadesse', 'chief@wolaita-sodo.gov.et', '+251-911-000-002', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'detective')
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES ('3', 'detective', 'detective123', 'detective_officer', 'Detective Sara Alemayehu', 'detective@wolaita-sodo.gov.et', '+251-911-000-003', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'officer')
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES ('4', 'officer', 'officer123', 'preventive_officer', 'Officer Mulugeta Kebede', 'officer@wolaita-sodo.gov.et', '+251-911-000-004', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'hr_manager')
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES ('5', 'hr_manager', 'hr123', 'hr_manager', 'HR Manager Hanan Mohammed', 'hr@wolaita-sodo.gov.et', '+251-911-000-005', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'citizen')
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES ('6', 'citizen', 'citizen123', 'citizen', 'Citizen Yohannes Bekele', 'citizen@example.com', '+251-911-000-006', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM crimes WHERE id = '1')
INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
VALUES ('1','Theft at Market Street','Mobile phone stolen from vendor at the main market area','theft','under_investigation','medium','Market Street, Downtown',DATEADD(day,-7,GETDATE()),DATEADD(hour,-1,DATEADD(day,-7,GETDATE())),'6','3',DATEADD(day,-7,GETDATE()),DATEADD(day,-7,GETDATE()));

IF NOT EXISTS (SELECT 1 FROM crimes WHERE id = '2')
INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
VALUES ('2','Domestic Violence Incident','Reported domestic violence case requiring immediate attention','domestic_violence','assigned','high','Residential Area, Block 5',DATEADD(day,-6,GETDATE()),DATEADD(hour,-1,DATEADD(day,-6,GETDATE())),'6','4',DATEADD(day,-6,GETDATE()),DATEADD(day,-6,GETDATE()));

IF NOT EXISTS (SELECT 1 FROM crimes WHERE id = '3')
INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at)
VALUES ('3','Vehicle Break-in','Car window broken and items stolen from vehicle','burglary','reported','medium','Parking Lot, City Center',DATEADD(day,-5,GETDATE()),DATEADD(hour,-2,DATEADD(day,-5,GETDATE())),'6',NULL,DATEADD(day,-5,GETDATE()),DATEADD(day,-5,GETDATE()));

IF NOT EXISTS (SELECT 1 FROM incidents WHERE id = 'INC-001')
INSERT INTO incidents (id, title, description, incident_type, severity, location, date_occurred, reported_by, reporter_name, status, follow_up_required, related_case_id, created_at, updated_at)
VALUES ('INC-001','Suspicious Vehicle in Downtown Area','Unmarked van parked for extended period near government building. License plate partially obscured.','suspicious_activity','medium','Main Street, near City Hall',DATEADD(day,-1,GETDATE()),'4','Officer Mulugeta Kebede','investigating',1,NULL,GETDATE(),GETDATE());

IF NOT EXISTS (SELECT 1 FROM incidents WHERE id = 'INC-002')
INSERT INTO incidents (id, title, description, incident_type, severity, location, date_occurred, reported_by, reporter_name, status, follow_up_required, related_case_id, created_at, updated_at)
VALUES ('INC-002','Noise Complaint - Residential Area','Loud music and disturbance reported by multiple residents in Block 5.','noise_complaint','low','Residential Block 5, Apartment 12B',DATEADD(day,-1,GETDATE()),'7','Officer Almaz Worku','resolved',0,NULL,GETDATE(),GETDATE());

IF NOT EXISTS (SELECT 1 FROM pending_accounts WHERE id = 'P1')
INSERT INTO pending_accounts (id, full_name, username, email, phone, requested_role, submitted_date, status, documents, notes, created_at, updated_at)
VALUES ('P1','Officer Candidate Bereket Haile','bereket_h','bereket.haile@example.com','+251-911-000-100','preventive_officer',DATEADD(day,-2,GETDATE()),'pending','["police_certificate.pdf","training_completion.pdf"]','Recent police academy graduate with high scores',GETDATE(),GETDATE());

IF NOT EXISTS (SELECT 1 FROM pending_accounts WHERE id = 'P2')
INSERT INTO pending_accounts (id, full_name, username, email, phone, requested_role, submitted_date, status, documents, notes, created_at, updated_at)
VALUES ('P2','Detective Trainee Meron Gebre','meron_g','meron.gebre@example.com','+251-911-000-101','detective_officer',DATEADD(day,-4,GETDATE()),'pending','["detective_certification.pdf","background_check.pdf"]','Specialized in cybercrime investigation',GETDATE(),GETDATE());

IF NOT EXISTS (SELECT 1 FROM pending_accounts WHERE id = 'P3')
INSERT INTO pending_accounts (id, full_name, username, email, phone, requested_role, submitted_date, status, documents, notes, created_at, updated_at)
VALUES ('P3','Citizen Registration - Kebede Alemu','kebede_a','kebede.alemu@example.com',NULL,'citizen',DATEADD(day,-1,GETDATE()),'pending',NULL,'Standard citizen registration for crime reporting access',GETDATE(),GETDATE());
