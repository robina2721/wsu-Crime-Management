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
