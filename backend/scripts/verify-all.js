const http = require('http');
const app = require('../app');
const config = require('../config/environment');

async function runLiveVerification() {
  console.log('=== STARTING MEDICONNECT LIVE HTTP INTEGRATION PROBE ===');
  console.log(`Port: ${config.port}`);

  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(config.port, '127.0.0.1', resolve));
  console.log(`[PASS] Server successfully bound to http://127.0.0.1:${config.port}`);

  const baseUrl = `http://127.0.0.1:${config.port}`;

  // Helper for HTTP requests
  function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(url, {
        method,
        headers
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body, headers: res.headers });
          }
        });
      });

      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  try {
    // 1. Health Check
    console.log('\n1. Testing Backend Health Check...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status}, Response:`, health.data);
    if (health.status !== 200 || health.data.status !== 'healthy') {
      throw new Error('Health check failed!');
    }
    console.log('   [PASS] Health check verified.');

    // 2. Patient Registration
    console.log('\n2. Testing Patient Registration...');
    const patientEmail = `emily_${Date.now()}@example.com`;
    const regPatient = await makeRequest('POST', '/api/auth/register/patient', {
      fullName: 'Emily Rose',
      email: patientEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+1-555-0188',
      gender: 'female',
      dateOfBirth: '1996-05-20',
      bloodGroup: 'B+',
      address: '742 Evergreen Terrace',
      emergencyContact: 'Homer Rose (+1-555-0189)'
    });
    console.log(`   Status: ${regPatient.status}, User ID:`, regPatient.data?.user?.id);
    if (regPatient.status !== 201 || !regPatient.data?.token) {
      throw new Error(`Patient registration failed: ${JSON.stringify(regPatient.data)}`);
    }
    console.log('   [PASS] Patient registration verified.');

    // 3. Patient Login
    console.log('\n3. Testing Patient Login...');
    const loginPatient = await makeRequest('POST', '/api/auth/login', {
      email: patientEmail,
      password: 'Password@123',
      requestedRole: 'patient'
    });
    console.log(`   Status: ${loginPatient.status}, Role:`, loginPatient.data?.user?.role);
    if (loginPatient.status !== 200 || !loginPatient.data?.token) {
      throw new Error(`Patient login failed: ${JSON.stringify(loginPatient.data)}`);
    }
    const patientToken = loginPatient.data.token;
    console.log('   [PASS] Patient login verified with JWT.');

    // 4. Doctor Registration
    console.log('\n4. Testing Doctor Registration...');
    const docEmail = `dr_wilson_${Date.now()}@example.com`;
    const regDoctor = await makeRequest('POST', '/api/auth/register/doctor', {
      fullName: 'Dr. James Wilson',
      email: docEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+1-555-0144',
      specialization: 'Oncology',
      qualifications: 'MD, McGill University',
      experienceYears: 18,
      medicalLicenseNumber: `MED-LIC-ONC-${Date.now()}`,
      biography: 'Specializing in solid tumors and oncology clinical trials.',
      consultationFee: 200,
      hospitalName: 'Seattle Oncology Associates',
      hospitalAddress: '1220 Terry Ave',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101'
    });
    console.log(`   Status: ${regDoctor.status}, Status:`, regDoctor.data?.user?.verificationStatus);
    if (regDoctor.status !== 201 || !regDoctor.data?.token) {
      throw new Error(`Doctor registration failed: ${JSON.stringify(regDoctor.data)}`);
    }
    console.log('   [PASS] Doctor registration verified with pending verification.');

    // 5. Doctor Login
    console.log('\n5. Testing Doctor Login...');
    const loginDoctor = await makeRequest('POST', '/api/auth/login', {
      email: docEmail,
      password: 'Password@123',
      requestedRole: 'doctor'
    });
    console.log(`   Status: ${loginDoctor.status}, Doctor ID:`, loginDoctor.data?.user?.profile?.id);
    if (loginDoctor.status !== 200 || !loginDoctor.data?.token) {
      throw new Error(`Doctor login failed: ${JSON.stringify(loginDoctor.data)}`);
    }
    console.log('   [PASS] Doctor login verified.');

    // 6. Google Sign-In
    console.log('\n6. Testing Google Sign-In...');
    const googleLogin = await makeRequest('POST', '/api/auth/google', {
      idToken: 'mock_google_id_token_patient',
      targetRole: 'patient'
    });
    console.log(`   Status: ${googleLogin.status}, User:`, googleLogin.data?.user?.email);
    if (googleLogin.status !== 200 || !googleLogin.data?.token) {
      throw new Error(`Google login failed: ${JSON.stringify(googleLogin.data)}`);
    }
    console.log('   [PASS] Google sign-in verified.');

    // 7. Doctor Directory & Specializations
    console.log('\n7. Testing Doctor Directory & Specialization APIs...');
    const specs = await makeRequest('GET', '/api/doctors/specializations');
    console.log(`   Status: ${specs.status}, Specializations:`, specs.data?.specializations?.slice(0, 4));
    if (specs.status !== 200 || !Array.isArray(specs.data?.specializations)) {
      throw new Error('Specializations API failed!');
    }

    const doctors = await makeRequest('GET', '/api/doctors');
    console.log(`   Status: ${doctors.status}, Approved Doctors count:`, doctors.data?.doctors?.length);
    if (doctors.status !== 200 || doctors.data?.doctors?.length === 0) {
      throw new Error('Doctor directory API failed!');
    }
    console.log('   [PASS] Doctor and specialization APIs verified.');

    // 8. Doctor Availability Calculation
    console.log('\n8. Testing Doctor Availability & Slot Generation...');
    const avail = await makeRequest('GET', '/api/doctors/1/availability?date=2026-11-10');
    console.log(`   Status: ${avail.status}, Available slots:`, avail.data?.availableSlots?.length);
    if (avail.status !== 200 || !Array.isArray(avail.data?.availableSlots)) {
      throw new Error('Doctor availability API failed!');
    }
    console.log('   [PASS] Doctor slot generation verified.');

    // 9. Appointment Booking
    console.log('\n9. Testing Appointment Booking...');
    const slot = avail.data.availableSlots[0];
    const booking = await makeRequest('POST', '/api/appointments', {
      doctorId: 1,
      appointmentDatetime: slot.startDatetime,
      patientNotes: 'Routine cardiology follow-up consultation.'
    }, patientToken);
    console.log(`   Status: ${booking.status}, Ref:`, booking.data?.appointment?.appointment_reference);
    if (booking.status !== 201 || !booking.data?.appointment?.id) {
      throw new Error('Appointment booking failed!');
    }
    console.log('   [PASS] Appointment booking verified.');

    console.log('\n======================================================');
    console.log('>>> ALL 9 INTEGRATION SUITES PASSED FLAWLESSLY! <<<');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runLiveVerification().catch(err => {
  console.error('\n[FAIL] Live verification failed:', err);
  process.exit(1);
});
