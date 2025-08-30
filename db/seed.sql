INSERT INTO users (id, username, password, role, full_name, email, phone, is_active, created_at, updated_at)
VALUES
  ('1', 'admin', 'admin123', 'super_admin', 'System Administrator', 'admin@wolaita-sodo.gov.et', '+251-911-000-001', TRUE, now(), now()),
  ('2', 'police_head', 'police123', 'police_head', 'Chief Inspector Dawit Tadesse', 'chief@wolaita-sodo.gov.et', '+251-911-000-002', TRUE, now(), now()),
  ('3', 'detective', 'detective123', 'detective_officer', 'Detective Sara Alemayehu', 'detective@wolaita-sodo.gov.et', '+251-911-000-003', TRUE, now(), now()),
  ('4', 'officer', 'officer123', 'preventive_officer', 'Officer Mulugeta Kebede', 'officer@wolaita-sodo.gov.et', '+251-911-000-004', TRUE, now(), now()),
  ('5', 'hr_manager', 'hr123', 'hr_manager', 'HR Manager Hanan Mohammed', 'hr@wolaita-sodo.gov.et', '+251-911-000-005', TRUE, now(), now()),
  ('6', 'citizen', 'citizen123', 'citizen', 'Citizen Yohannes Bekele', 'citizen@example.com', '+251-911-000-006', TRUE, now(), now())
ON CONFLICT (username) DO NOTHING;

INSERT INTO crimes (id, title, description, category, status, priority, location, date_reported, date_incident, reported_by, assigned_to, created_at, updated_at) VALUES
  ('1', 'Theft at Market Street', 'Mobile phone stolen from vendor at the main market area', 'theft', 'under_investigation', 'medium', 'Market Street, Downtown', now() - INTERVAL '7 days', now() - INTERVAL '7 days 1 hour', '6', '3', now() - INTERVAL '7 days', now() - INTERVAL '7 days'),
  ('2', 'Domestic Violence Incident', 'Reported domestic violence case requiring immediate attention', 'domestic_violence', 'assigned', 'high', 'Residential Area, Block 5', now() - INTERVAL '6 days', now() - INTERVAL '6 days 1 hour', '6', '4', now() - INTERVAL '6 days', now() - INTERVAL '6 days'),
  ('3', 'Vehicle Break-in', 'Car window broken and items stolen from vehicle', 'burglary', 'reported', 'medium', 'Parking Lot, City Center', now() - INTERVAL '5 days', now() - INTERVAL '5 days 2 hours', '6', NULL, now() - INTERVAL '5 days', now() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;
