-- MediConnect Sample Development Data
-- Clearly fictional entries for development and verification

USE mediconnect;

-- Disable foreign key checks for clean seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE reviews;
TRUNCATE TABLE medical_record_shares;
TRUNCATE TABLE medical_summaries;
TRUNCATE TABLE medical_records;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctor_unavailability;
TRUNCATE TABLE doctor_availability;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users
-- Passwords:
-- Admin: Admin@123456
-- Doctors: Doctor@123456
-- Patient: Patient@123456

INSERT INTO users (id, full_name, email, password_hash, phone, role) VALUES
(1, 'System Administrator', 'admin@mediconnect.local', '$2a$10$hY3eIeuBZ56jJlNZxQiODuTmX/4yHy2gr4Zr2dtj6vAnEPBud5NH.', '+1-555-0100', 'admin'),
(2, 'Dr. Sarah Jenkins', 'sarah.jenkins@mediconnect.local', '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', '+1-555-0101', 'doctor'),
(3, 'Dr. Alexander Patel', 'alex.patel@mediconnect.local', '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', '+1-555-0102', 'doctor'),
(4, 'Dr. Elena Rostova', 'elena.rostova@mediconnect.local', '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', '+1-555-0103', 'doctor'),
(5, 'Dr. Marcus Chen', 'marcus.chen@mediconnect.local', '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', '+1-555-0104', 'doctor'),
(6, 'Dr. Olivia Vance', 'olivia.vance@mediconnect.local', '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', '+1-555-0105', 'doctor'),
(7, 'John Doe', 'patient@mediconnect.local', '$2a$10$Z6Oy0asKSgVpkhfmgmNcwe0ri.kbcNhbJVS3Crmo4PghceEJeIhoS', '+1-555-0199', 'patient');

-- 2. Patients
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact) VALUES
(1, 7, '1988-06-15', 'male', 'O+', '452 Elm Street, Seattle, WA', 'Jane Doe (+1-555-0198)');

-- 3. Doctors (Fictional Approved Doctors and 1 Pending for Admin Approval testing)
INSERT INTO doctors (id, user_id, specialization, qualifications, experience_years, medical_license_number, biography, consultation_fee, hospital_name, hospital_address, city, state, postal_code, hospital_phone, verification_status, average_rating, total_reviews) VALUES
(1, 2, 'Cardiology', 'MD, FACC, Harvard Medical School', 14, 'MED-LIC-WA-88219', 'Board-certified cardiologist specializing in preventive cardiology, coronary artery disease management, and non-invasive cardiovascular imaging.', 150.00, 'Seattle Heart & Vascular Center', '1200 Terry Ave', 'Seattle', 'Washington', '98101', '+1-206-555-1212', 'approved', 4.90, 18),
(2, 3, 'Dermatology', 'MD, FAAD, Johns Hopkins University', 9, 'MED-LIC-WA-99104', 'Specialist in clinical and aesthetic dermatology, treating chronic skin conditions, dermatitis, eczema, and skin cancer screenings.', 120.00, 'Evergreen Skin & Wellness Institute', '801 Pine St, Suite 400', 'Seattle', 'Washington', '98101', '+1-206-555-3434', 'approved', 4.85, 12),
(3, 4, 'Neurology', 'MD, PhD, Stanford University School of Medicine', 16, 'MED-LIC-CA-44321', 'Neurologist with advanced fellowship training in headache disorders, peripheral neuropathy, and neurological rehabilitation.', 180.00, 'Pacific Brain & Spine Clinic', '500 Parnassus Ave', 'San Francisco', 'California', '94143', '+1-415-555-7890', 'approved', 4.95, 24),
(4, 5, 'Pediatrics', 'MD, FAAP, Columbia University', 11, 'MED-LIC-NY-33215', 'Compassionate general pediatrician dedicated to developmental tracking, childhood preventive care, and adolescent health.', 110.00, 'Metro Childrens Health Center', '420 Lexington Ave', 'New York', 'New York', '10170', '+1-212-555-6677', 'approved', 4.75, 8),
(5, 6, 'General Medicine', 'DO, Midwestern University', 5, 'MED-LIC-IL-77112', 'Primary care physician focusing on holistic family health, chronic illness monitoring, and adult preventive wellness.', 90.00, 'Midwest Community Clinic', '300 N Michigan Ave', 'Chicago', 'Illinois', '60601', '+1-312-555-9988', 'pending', 0.00, 0);

-- 4. Doctor Availability (Mon - Fri: 09:00 - 17:00, 30 min slots, lunch break 13:00 - 14:00)
-- day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time, is_active) VALUES
-- Dr. Sarah Jenkins (Mon - Thu)
(1, 1, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 1),
(1, 2, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 1),
(1, 3, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 1),
(1, 4, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 1),

-- Dr. Alexander Patel (Tue - Fri)
(2, 2, '10:00:00', '18:00:00', 30, '13:30:00', '14:30:00', 1),
(2, 3, '10:00:00', '18:00:00', 30, '13:30:00', '14:30:00', 1),
(2, 4, '10:00:00', '18:00:00', 30, '13:30:00', '14:30:00', 1),
(2, 5, '10:00:00', '16:00:00', 30, '13:00:00', '14:00:00', 1),

-- Dr. Elena Rostova (Mon, Wed, Fri)
(3, 1, '09:30:00', '16:30:00', 45, '12:30:00', '13:30:00', 1),
(3, 3, '09:30:00', '16:30:00', 45, '12:30:00', '13:30:00', 1),
(3, 5, '09:30:00', '15:30:00', 45, '12:30:00', '13:30:00', 1),

-- Dr. Marcus Chen (Mon - Fri)
(4, 1, '08:30:00', '16:30:00', 30, '12:30:00', '13:30:00', 1),
(4, 2, '08:30:00', '16:30:00', 30, '12:30:00', '13:30:00', 1),
(4, 3, '08:30:00', '16:30:00', 30, '12:30:00', '13:30:00', 1),
(4, 4, '08:30:00', '16:30:00', 30, '12:30:00', '13:30:00', 1),
(4, 5, '08:30:00', '14:00:00', 30, NULL, NULL, 1);
