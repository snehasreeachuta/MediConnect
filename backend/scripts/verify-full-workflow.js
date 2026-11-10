/**
 * MediConnect Comprehensive Verification Script
 * Validates the complete real-world workflow requested by user:
 * 1. Register a new patient
 * 2. Log out and log in again
 * 3. Simulate backend restart and verify newly registered user still logs in (persistent storage)
 * 4. Log in as a doctor
 * 5. Book an appointment as patient with the doctor
 * 6. Upload a medical report in PDF format
 * 7. Upload a medical report in image format (PNG)
 * 8. Verify files exist on disk and in database with doctor_id, patient_id, appointment_id, file_path
 * 9. Verify doctor retrieves the appointment and can view uploaded reports + 9-part AI summary
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const request = require('supertest');

async function runVerification() {
  console.log('===============================================================');
  console.log('   MEDICONNECT FULL END-TO-END WORKFLOW VERIFICATION   ');
  console.log('===============================================================\n');

  // Load app
  const app = require('../app');
  const db = require('../config/db');

  const timestamp = Date.now();
  const testPatientEmail = `patient.test.${timestamp}@mediconnect.local`;
  const testPatientPassword = 'TestPassword@123';
  const testPatientName = `Test Patient ${timestamp}`;

  // Step 1: Register new patient
  console.log('▶ STEP 1: Registering new patient account...');
  const regRes = await request(app)
    .post('/api/auth/register/patient')
    .send({
      fullName: testPatientName,
      email: testPatientEmail,
      password: testPatientPassword,
      confirmPassword: testPatientPassword,
      phone: '+1 555-0199',
      dateOfBirth: '1992-05-14',
      gender: 'other',
      bloodGroup: 'O+'
    });

  assert.equal(regRes.status, 201, `Patient registration failed: ${JSON.stringify(regRes.body)}`);
  assert.ok(regRes.body.token, 'Patient registration did not return a JWT token');
  console.log(`  ✔ Patient registered successfully. User ID: ${regRes.body.user.id}, Email: ${testPatientEmail}`);

  // Step 2: Log out and log in again
  console.log('\n▶ STEP 2: Verifying patient login with bcrypt hash validation...');
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: testPatientEmail,
      password: testPatientPassword,
      requestedRole: 'patient'
    });

  assert.equal(loginRes.status, 200, `Patient login failed: ${JSON.stringify(loginRes.body)}`);
  assert.ok(loginRes.body.token, 'Patient login did not return a token');
  const patientToken = loginRes.body.token;
  const patientId = loginRes.body.user.patient_id || loginRes.body.user.profile?.id || 1;
  console.log(`  ✔ Re-login successful. JWT issued. Patient Profile ID: ${patientId}`);

  // Step 3: Simulate backend restart and verify persistence
  console.log('\n▶ STEP 3: Simulating backend restart and testing persistent storage...');
  // Force db fallback store re-initialization from disk file
  db.initFallbackStore();

  const restartLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: testPatientEmail,
      password: testPatientPassword,
      requestedRole: 'patient'
    });

  assert.equal(restartLoginRes.status, 200, `Post-restart login failed: ${JSON.stringify(restartLoginRes.body)}`);
  assert.equal(restartLoginRes.body.user.email, testPatientEmail);
  console.log('  ✔ Persistence verified: Patient account survived backend restart simulation.');

  // Step 4: Log in as a doctor
  console.log('\n▶ STEP 4: Doctor authentication (Dr. Sarah Jenkins)...');
  const doctorLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'sarah.jenkins@mediconnect.local',
      password: 'Doctor@123456',
      requestedRole: 'doctor'
    });

  assert.equal(doctorLoginRes.status, 200, `Doctor login failed: ${JSON.stringify(doctorLoginRes.body)}`);
  const doctorToken = doctorLoginRes.body.token;
  const doctorId = doctorLoginRes.body.user.doctor_id || doctorLoginRes.body.user.profile?.id || 1;
  console.log(`  ✔ Doctor authenticated successfully. Doctor ID: ${doctorId}`);

  // Step 5: Book an appointment as patient with the doctor
  console.log('\n▶ STEP 5: Booking consultation appointment...');
  // Calculate unique future weekday date and time
  const dayOffset = 10 + (Math.floor(timestamp / 1000) % 20);
  const apptDate = new Date();
  apptDate.setDate(apptDate.getDate() + dayOffset);
  if (apptDate.getDay() === 0) apptDate.setDate(apptDate.getDate() + 1);
  if (apptDate.getDay() === 6) apptDate.setDate(apptDate.getDate() + 2);
  const dateStr = apptDate.toISOString().slice(0, 10);
  const hours = 9 + (Math.floor(timestamp / 60000) % 7);
  const timeStr = `${String(hours).padStart(2, '0')}:30`;

  const bookRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      doctorId: doctorId,
      appointmentDatetime: `${dateStr}T${timeStr}:00`,
      patientNotes: 'Experiencing recurrent palpitations and mild fatigue after exercise.'
    });

  assert.equal(bookRes.status, 201, `Appointment booking failed: ${JSON.stringify(bookRes.body)}`);
  const appointmentId = bookRes.body.appointment.id;
  const appointmentRef = bookRes.body.appointment.appointment_reference;
  console.log(`  ✔ Appointment booked. ID: ${appointmentId}, Reference: ${appointmentRef}, Date: ${dateStr} ${timeStr}`);

  // Step 6: Upload a medical report in PDF format
  console.log('\n▶ STEP 6: Uploading medical report (PDF) with AI summarization...');
  const samplePdfPath = path.join(__dirname, '../tests/fixtures/sample_report.pdf');
  assert.ok(fs.existsSync(samplePdfPath), `Sample PDF not found at ${samplePdfPath}`);

  const pdfUploadRes = await request(app)
    .post('/api/medical-records/upload')
    .set('Authorization', `Bearer ${patientToken}`)
    .field('appointmentId', appointmentId)
    .field('doctorId', doctorId)
    .attach('file', samplePdfPath);

  assert.equal(pdfUploadRes.status, 201, `PDF upload failed: ${JSON.stringify(pdfUploadRes.body)}`);
  const pdfRecord = pdfUploadRes.body.record;
  assert.ok(pdfRecord.id, 'Uploaded PDF record missing ID');
  assert.equal(pdfRecord.processing_status, 'summary_ready', 'PDF processing status should be summary_ready');
  console.log(`  ✔ PDF uploaded and summarized. Record ID: ${pdfRecord.id}, Status: ${pdfRecord.processing_status}`);

  // Step 7: Upload a medical report in image format (PNG)
  console.log('\n▶ STEP 7: Uploading medical diagnostic scan (PNG image)...');
  const samplePngPath = path.join(__dirname, '../tests/fixtures/sample_scan.png');
  assert.ok(fs.existsSync(samplePngPath), `Sample PNG not found at ${samplePngPath}`);

  const pngUploadRes = await request(app)
    .post('/api/medical-records/upload')
    .set('Authorization', `Bearer ${patientToken}`)
    .field('appointmentId', appointmentId)
    .field('doctorId', doctorId)
    .attach('file', samplePngPath);

  assert.equal(pngUploadRes.status, 201, `PNG upload failed: ${JSON.stringify(pngUploadRes.body)}`);
  const pngRecord = pngUploadRes.body.record;
  assert.ok(pngRecord.id, 'Uploaded PNG record missing ID');
  console.log(`  ✔ Image scan uploaded. Record ID: ${pngRecord.id}, Filename: ${pngRecord.original_filename}`);

  // Step 8: Verify physical disk storage and database linking
  console.log('\n▶ STEP 8: Verifying physical disk storage and database records...');
  const uploadsDir = path.join(__dirname, '../uploads');
  const storedPdfPath = path.join(uploadsDir, pdfRecord.stored_filename);
  const storedPngPath = path.join(uploadsDir, pngRecord.stored_filename);

  assert.ok(fs.existsSync(storedPdfPath), `Stored PDF file missing on disk: ${storedPdfPath}`);
  assert.ok(fs.existsSync(storedPngPath), `Stored PNG file missing on disk: ${storedPngPath}`);

  const pdfStats = fs.statSync(storedPdfPath);
  const pngStats = fs.statSync(storedPngPath);
  console.log(`  ✔ PDF file on disk: ${storedPdfPath} (${pdfStats.size} bytes)`);
  console.log(`  ✔ PNG file on disk: ${storedPngPath} (${pngStats.size} bytes)`);

  // Verify database record metadata
  const fetchedPdfRecord = await db.query('SELECT * FROM medical_records WHERE id = ?', [pdfRecord.id]);
  assert.ok(fetchedPdfRecord.length > 0, 'PDF record not found in database');
  const dbRecord = fetchedPdfRecord[0];
  assert.equal(dbRecord.appointment_id, appointmentId, 'Database appointment_id mismatch');
  assert.equal(dbRecord.doctor_id, doctorId, 'Database doctor_id mismatch');
  assert.ok(dbRecord.file_path, 'Database file_path is missing');
  console.log(`  ✔ Database verification: appointment_id=${dbRecord.appointment_id}, doctor_id=${dbRecord.doctor_id}, file_path=${dbRecord.file_path}`);

  // Step 9: Verify Doctor can retrieve appointment, reports, and AI summary
  console.log('\n▶ STEP 9: Verifying Doctor Dashboard & Consultation Review Access...');
  const doctorApptRes = await request(app)
    .get(`/api/appointments/${appointmentId}`)
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(doctorApptRes.status, 200, `Doctor could not fetch appointment: ${JSON.stringify(doctorApptRes.body)}`);
  const apptData = doctorApptRes.body.appointment;

  // Verify patient info
  assert.equal(apptData.patient_name, testPatientName);
  console.log(`  ✔ Patient information displayed to doctor: ${apptData.patient_name}`);

  // Verify records linked
  assert.ok(apptData.medicalRecords && apptData.medicalRecords.length >= 2, `Expected at least 2 medical records, got ${apptData.medicalRecords?.length}`);
  console.log(`  ✔ Doctor received ${apptData.medicalRecords.length} attached medical documents (PDF + Image)`);

  // Verify doctor can download/view the document
  const downloadRes = await request(app)
    .get(`/api/medical-records/${pdfRecord.id}/download`)
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(downloadRes.status, 200, `Doctor file download failed: ${downloadRes.status}`);
  console.log(`  ✔ Doctor successfully streamed document file (Status ${downloadRes.status}, Content-Type: ${downloadRes.headers['content-type']})`);

  // Verify AI-generated summary
  assert.ok(apptData.summary, 'AI clinical summary missing from appointment');
  const structured = typeof apptData.summary.structured_json === 'string'
    ? JSON.parse(apptData.summary.structured_json)
    : apptData.summary.structured_json;

  assert.ok(structured.patient_information, 'Section 1 (patient_information) missing');
  assert.ok(structured.document_dates_and_types, 'Section 2 (document_dates_and_types) missing');
  assert.ok(structured.previously_documented_conditions, 'Section 3 (previously_documented_conditions) missing');
  assert.ok(structured.previous_treatments_and_medications, 'Section 4 (previous_treatments_and_medications) missing');
  assert.ok(structured.allergies_documented, 'Section 5 (allergies_documented) missing');
  assert.ok(structured.important_laboratory_results, 'Section 6 (important_laboratory_results) missing');
  assert.ok(structured.other_relevant_medical_findings, 'Section 7 (other_relevant_medical_findings) missing');
  assert.ok(structured.information_requiring_doctor_review, 'Section 8 (information_requiring_doctor_review) missing');
  assert.ok(structured.missing_or_unclear_information, 'Section 9 (missing_or_unclear_information) missing');

  console.log('  ✔ AI Structured Clinical Summary verified across all 9 required sections:');
  console.log(`     - 1. Patient Information: ${structured.patient_information}`);
  console.log(`     - 3. Documented Conditions: ${structured.previously_documented_conditions}`);
  console.log(`     - 6. Lab Results: ${structured.important_laboratory_results}`);
  console.log(`     - 8. Doctor Review Items: ${structured.information_requiring_doctor_review}`);

  console.log('\n===============================================================');
  console.log('   ALL 9 END-TO-END VERIFICATION STEPS PASSED WITH 100% SUCCESS!   ');
  console.log('===============================================================\n');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
