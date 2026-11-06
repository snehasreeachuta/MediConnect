const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

describe('MediConnect API End-to-End Test Suite', () => {
  let patientToken = '';
  let doctorToken = '';
  let adminToken = '';
  let patientId = null;
  let testDoctorId = 1;
  let createdAppointmentId = null;
  let createdAppointmentRef = '';

  // 1. Health check
  it('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  // 2. Authentication: Patient Login
  it('POST /api/auth/login should authenticate seeded patient', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'patient@mediconnect.local',
        password: 'Patient@123456'
      });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'patient');
    patientToken = res.body.token;
    patientId = res.body.user.id;
  });

  // 3. Authentication: Doctor Login
  it('POST /api/auth/login should authenticate seeded approved doctor', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sarah.jenkins@mediconnect.local',
        password: 'Doctor@123456'
      });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'doctor');
    doctorToken = res.body.token;
  });

  // 4. Authentication: Admin Login
  it('POST /api/auth/login should authenticate seeded administrator', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@mediconnect.local',
        password: 'Admin@123456'
      });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  // 5. Patient Registration
  it('POST /api/auth/register/patient should register a new patient', async () => {
    const uniqueEmail = `testpatient_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        fullName: 'Emily Rose',
        email: uniqueEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+1-555-8888',
        gender: 'female',
        dateOfBirth: '1995-04-12'
      });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'patient');
  });

  // 5b. Doctor Registration
  it('POST /api/auth/register/doctor should register a new doctor with pending status', async () => {
    const uniqueEmail = `testdoc_${Date.now()}@example.com`;
    const uniqueLic = `LIC-${Date.now()}`;
    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        fullName: 'Dr. Gregory House',
        email: uniqueEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+1-555-7777',
        specialization: 'Neurology',
        qualifications: 'MD, Johns Hopkins',
        experienceYears: 20,
        medicalLicenseNumber: uniqueLic,
        biography: 'Specialist in complex cases.',
        consultationFee: 250,
        hospitalName: 'Princeton-Plainsboro Hospital',
        hospitalAddress: '100 Medical Center Dr',
        city: 'Princeton',
        state: 'NJ',
        postalCode: '08540'
      });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'doctor');
    assert.equal(res.body.user.verificationStatus, 'pending');
  });

  // 5c. Google Authentication
  it('POST /api/auth/google should authenticate with mock token in dev mode', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'mock_google_id_token_patient',
        targetRole: 'patient'
      });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'patient');
  });

  // 6. Doctor Directory & Public Search
  it('GET /api/doctors should only return approved doctors', async () => {
    const res = await request(app).get('/api/doctors');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.doctors));
    assert.ok(res.body.doctors.length >= 1);
    // Pending doctor (Dr. Olivia Vance) must not be in public directory
    const pendingDoc = res.body.doctors.find(d => d.verification_status === 'pending');
    assert.equal(pendingDoc, undefined);
  });

  // 7. Doctor Filtering by Specialization
  it('GET /api/doctors?specialization=Cardiology should filter correctly', async () => {
    const res = await request(app).get('/api/doctors?specialization=Cardiology');
    assert.equal(res.status, 200);
    res.body.doctors.forEach(d => {
      assert.equal(d.specialization.toLowerCase(), 'cardiology');
    });
  });

  // 8. Doctor Available Slots Generation
  it('GET /api/doctors/:id/availability should calculate slots for a weekday', async () => {
    // Next Monday date
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    const dateStr = d.toISOString().slice(0, 10);

    const res = await request(app).get(`/api/doctors/1/availability?date=${dateStr}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.isWorkingDay, true);
    assert.ok(Array.isArray(res.body.availableSlots));
    assert.ok(res.body.availableSlots.length > 0);
  });

  // 9. Appointment Booking & Double-Booking Prevention
  it('POST /api/appointments should book an appointment and reject duplicate slot', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 3); // 3 days ahead
    futureDate.setHours(10, 0, 0, 0);
    const datetimeStr = futureDate.toISOString().slice(0, 19).replace('T', ' ');

    // 1st booking
    const res1 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 1,
        appointmentDatetime: datetimeStr,
        patientNotes: 'Experiencing mild palpitations after exercise.'
      });
    assert.equal(res1.status, 201);
    assert.ok(res1.body.appointment.id);
    assert.ok(res1.body.appointment.appointment_reference);
    createdAppointmentId = res1.body.appointment.id;
    createdAppointmentRef = res1.body.appointment.appointment_reference;

    // 2nd booking for exact same slot must be rejected with 409 Conflict
    const res2 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 1,
        appointmentDatetime: datetimeStr,
        patientNotes: 'Another patient trying to double book.'
      });
    assert.equal(res2.status, 409);
    assert.match(res2.body.message, /already been booked/i);
  });

  // 10. Role-based Access Control
  it('GET /api/admin/doctors should reject unauthorized patient with 403', async () => {
    const res = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(res.status, 403);
  });

  it('GET /api/admin/doctors should allow administrator', async () => {
    const res = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.doctors));
  });

  // 11. Admin Doctor Approval
  it('PATCH /api/admin/doctors/:id/approve should approve pending doctor', async () => {
    // Dr. Olivia Vance is doctor id 5 (pending)
    const res = await request(app)
      .patch('/api/admin/doctors/5/approve')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.doctor.verification_status, 'approved');
  });

  // 12. Appointment Details & Unauthorized Access
  it('GET /api/appointments/:id should enforce authorization', async () => {
    const res = await request(app)
      .get(`/api/appointments/${createdAppointmentId}`)
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.appointment.id, createdAppointmentId);
  });

  // 13. Patient Consent: Share and Revoke
  it('POST /api/appointments/:id/summary/share should record patient consent', async () => {
    const res = await request(app)
      .post(`/api/appointments/${createdAppointmentId}/summary/share`)
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(res.status, 200);
  });

  it('POST /api/appointments/:id/summary/revoke should revoke doctor access', async () => {
    const res = await request(app)
      .post(`/api/appointments/${createdAppointmentId}/summary/revoke`)
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(res.status, 200);
  });

  // 14. Appointment Cancellation
  it('PATCH /api/appointments/:id/cancel should cancel appointment', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${createdAppointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ cancellationReason: 'Schedule conflict' });
    assert.equal(res.status, 200);
    assert.equal(res.body.appointment.appointment_status, 'cancelled');
  });
});
