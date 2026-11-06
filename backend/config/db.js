const mysql = require('mysql2/promise');
const config = require('./environment');

let pool = null;
let isFallbackMode = false;
let fallbackStore = null;

function getPool() {
  if (!pool && !isFallbackMode) {
    try {
      pool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        waitForConnections: true,
        connectionLimit: config.db.connectionLimit,
        queueLimit: 0,
        decimalNumbers: true,
        dateStrings: true
      });
    } catch (e) {
      console.warn('MySQL pool creation deferred.');
    }
  }
  return pool;
}

/**
 * Initialize fallback in-memory store for seamless offline/dev testing
 */
function initFallbackStore() {
  if (fallbackStore) return fallbackStore;

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  fallbackStore = {
    users: [
      { id: 1, full_name: 'System Administrator', email: 'admin@mediconnect.local', password_hash: '$2a$10$hY3eIeuBZ56jJlNZxQiODuTmX/4yHy2gr4Zr2dtj6vAnEPBud5NH.', phone: '+1-555-0100', role: 'admin', google_subject: null, created_at: now, updated_at: now },
      { id: 2, full_name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@mediconnect.local', password_hash: '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', phone: '+1-555-0101', role: 'doctor', google_subject: null, created_at: now, updated_at: now },
      { id: 3, full_name: 'Dr. Alexander Patel', email: 'alex.patel@mediconnect.local', password_hash: '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', phone: '+1-555-0102', role: 'doctor', google_subject: null, created_at: now, updated_at: now },
      { id: 4, full_name: 'Dr. Elena Rostova', email: 'elena.rostova@mediconnect.local', password_hash: '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', phone: '+1-555-0103', role: 'doctor', google_subject: null, created_at: now, updated_at: now },
      { id: 5, full_name: 'Dr. Marcus Chen', email: 'marcus.chen@mediconnect.local', password_hash: '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', phone: '+1-555-0104', role: 'doctor', google_subject: null, created_at: now, updated_at: now },
      { id: 6, full_name: 'Dr. Olivia Vance', email: 'olivia.vance@mediconnect.local', password_hash: '$2a$10$I4BNeexHQSgO/BOU/nyEKe8i3x1n.ZHnM/7hBzkJzJGepFwEEb7lW', phone: '+1-555-0105', role: 'doctor', google_subject: null, created_at: now, updated_at: now },
      { id: 7, full_name: 'John Doe', email: 'patient@mediconnect.local', password_hash: '$2a$10$Z6Oy0asKSgVpkhfmgmNcwe0ri.kbcNhbJVS3Crmo4PghceEJeIhoS', phone: '+1-555-0199', role: 'patient', google_subject: null, created_at: now, updated_at: now }
    ],
    patients: [
      { id: 1, user_id: 7, date_of_birth: '1988-06-15', gender: 'male', blood_group: 'O+', address: '452 Elm Street, Seattle, WA', emergency_contact: 'Jane Doe (+1-555-0198)', created_at: now, updated_at: now }
    ],
    doctors: [
      { id: 1, user_id: 2, specialization: 'Cardiology', qualifications: 'MD, FACC, Harvard Medical School', experience_years: 14, medical_license_number: 'MED-LIC-WA-88219', biography: 'Board-certified cardiologist specializing in preventive cardiology, coronary artery disease management, and non-invasive cardiovascular imaging.', consultation_fee: 150.00, hospital_name: 'Seattle Heart & Vascular Center', hospital_address: '1200 Terry Ave', city: 'Seattle', state: 'Washington', postal_code: '98101', hospital_phone: '+1-206-555-1212', verification_status: 'approved', average_rating: 4.90, total_reviews: 18, created_at: now, updated_at: now },
      { id: 2, user_id: 3, specialization: 'Dermatology', qualifications: 'MD, FAAD, Johns Hopkins University', experience_years: 9, medical_license_number: 'MED-LIC-WA-99104', biography: 'Specialist in clinical and aesthetic dermatology, treating chronic skin conditions, dermatitis, eczema, and skin cancer screenings.', consultation_fee: 120.00, hospital_name: 'Evergreen Skin & Wellness Institute', hospital_address: '801 Pine St, Suite 400', city: 'Seattle', state: 'Washington', postal_code: '98101', hospital_phone: '+1-206-555-3434', verification_status: 'approved', average_rating: 4.85, total_reviews: 12, created_at: now, updated_at: now },
      { id: 3, user_id: 4, specialization: 'Neurology', qualifications: 'MD, PhD, Stanford University School of Medicine', experience_years: 16, medical_license_number: 'MED-LIC-CA-44321', biography: 'Neurologist with advanced fellowship training in headache disorders, peripheral neuropathy, and neurological rehabilitation.', consultation_fee: 180.00, hospital_name: 'Pacific Brain & Spine Clinic', hospital_address: '500 Parnassus Ave', city: 'San Francisco', state: 'California', postal_code: '94143', hospital_phone: '+1-415-555-7890', verification_status: 'approved', average_rating: 4.95, total_reviews: 24, created_at: now, updated_at: now },
      { id: 4, user_id: 5, specialization: 'Pediatrics', qualifications: 'MD, FAAP, Columbia University', experience_years: 11, medical_license_number: 'MED-LIC-NY-33215', biography: 'Compassionate general pediatrician dedicated to developmental tracking, childhood preventive care, and adolescent health.', consultation_fee: 110.00, hospital_name: 'Metro Childrens Health Center', hospital_address: '420 Lexington Ave', city: 'New York', state: 'New York', postal_code: '10170', hospital_phone: '+1-212-555-6677', verification_status: 'approved', average_rating: 4.75, total_reviews: 8, created_at: now, updated_at: now },
      { id: 5, user_id: 6, specialization: 'General Medicine', qualifications: 'DO, Midwestern University', experience_years: 5, medical_license_number: 'MED-LIC-IL-77112', biography: 'Primary care physician focusing on holistic family health, chronic illness monitoring, and adult preventive wellness.', consultation_fee: 90.00, hospital_name: 'Midwest Community Clinic', hospital_address: '300 N Michigan Ave', city: 'Chicago', state: 'Illinois', postal_code: '60601', hospital_phone: '+1-312-555-9988', verification_status: 'pending', average_rating: 0.00, total_reviews: 0, created_at: now, updated_at: now }
    ],
    doctor_availability: [
      { id: 1, doctor_id: 1, day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00', slot_duration_minutes: 30, break_start_time: '13:00:00', break_end_time: '14:00:00', is_active: 1 },
      { id: 2, doctor_id: 1, day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00', slot_duration_minutes: 30, break_start_time: '13:00:00', break_end_time: '14:00:00', is_active: 1 },
      { id: 3, doctor_id: 1, day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00', slot_duration_minutes: 30, break_start_time: '13:00:00', break_end_time: '14:00:00', is_active: 1 },
      { id: 4, doctor_id: 1, day_of_week: 4, start_time: '09:00:00', end_time: '17:00:00', slot_duration_minutes: 30, break_start_time: '13:00:00', break_end_time: '14:00:00', is_active: 1 },
      { id: 5, doctor_id: 2, day_of_week: 2, start_time: '10:00:00', end_time: '18:00:00', slot_duration_minutes: 30, break_start_time: '13:30:00', break_end_time: '14:30:00', is_active: 1 },
      { id: 6, doctor_id: 2, day_of_week: 3, start_time: '10:00:00', end_time: '18:00:00', slot_duration_minutes: 30, break_start_time: '13:30:00', break_end_time: '14:30:00', is_active: 1 },
      { id: 7, doctor_id: 2, day_of_week: 4, start_time: '10:00:00', end_time: '18:00:00', slot_duration_minutes: 30, break_start_time: '13:30:00', break_end_time: '14:30:00', is_active: 1 },
      { id: 8, doctor_id: 2, day_of_week: 5, start_time: '10:00:00', end_time: '16:00:00', slot_duration_minutes: 30, break_start_time: '13:00:00', break_end_time: '14:00:00', is_active: 1 },
      { id: 9, doctor_id: 3, day_of_week: 1, start_time: '09:30:00', end_time: '16:30:00', slot_duration_minutes: 45, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 10, doctor_id: 3, day_of_week: 3, start_time: '09:30:00', end_time: '16:30:00', slot_duration_minutes: 45, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 11, doctor_id: 3, day_of_week: 5, start_time: '09:30:00', end_time: '15:30:00', slot_duration_minutes: 45, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 12, doctor_id: 4, day_of_week: 1, start_time: '08:30:00', end_time: '16:30:00', slot_duration_minutes: 30, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 13, doctor_id: 4, day_of_week: 2, start_time: '08:30:00', end_time: '16:30:00', slot_duration_minutes: 30, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 14, doctor_id: 4, day_of_week: 3, start_time: '08:30:00', end_time: '16:30:00', slot_duration_minutes: 30, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 15, doctor_id: 4, day_of_week: 4, start_time: '08:30:00', end_time: '16:30:00', slot_duration_minutes: 30, break_start_time: '12:30:00', break_end_time: '13:30:00', is_active: 1 },
      { id: 16, doctor_id: 4, day_of_week: 5, start_time: '08:30:00', end_time: '14:00:00', slot_duration_minutes: 30, break_start_time: null, break_end_time: null, is_active: 1 }
    ],
    doctor_unavailability: [],
    appointments: [],
    medical_records: [],
    medical_summaries: [],
    medical_record_shares: [],
    reviews: [],
    audit_logs: []
  };

  return fallbackStore;
}

/**
 * Execute parameterized query with automatic fallback if MySQL server is offline
 */
async function query(sql, params = []) {
  if (!isFallbackMode) {
    try {
      const currentPool = getPool();
      if (currentPool) {
        const [results] = await currentPool.execute(sql, params);
        return results;
      }
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'EACCES' || err.code === 'ENOTFOUND') {
        console.warn(`[MediConnect DB] MySQL connection not available (${err.code}). Activating In-Memory Dev Store.`);
        isFallbackMode = true;
      } else {
        throw err;
      }
    }
  }

  return executeFallbackQuery(sql, params);
}

/**
 * In-memory fallback query executor
 */
function executeFallbackQuery(sql, params = []) {
  const store = initFallbackStore();
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // Helper: clone object
  const clone = obj => JSON.parse(JSON.stringify(obj));

  // 1. SELECT queries
  if (upper.startsWith('SELECT')) {
    // USERS lookup
    if (upper.includes('FROM USERS')) {
      if (upper.includes('EMAIL =')) {
        const email = params[0];
        const user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        return user ? [clone(user)] : [];
      }
      if (upper.includes('ID =')) {
        const id = Number(params[0]);
        const user = store.users.find(u => u.id === id);
        return user ? [clone(user)] : [];
      }
      if (upper.includes('GOOGLE_SUBJECT =')) {
        const sub = params[0];
        const user = store.users.find(u => u.google_subject === sub);
        return user ? [clone(user)] : [];
      }
      return clone(store.users);
    }

    // PATIENTS lookup
    if (upper.includes('FROM PATIENTS')) {
      if (upper.includes('USER_ID =')) {
        const uid = Number(params[0]);
        const p = store.patients.find(pt => pt.user_id === uid);
        return p ? [clone(p)] : [];
      }
      if (upper.includes('ID =')) {
        const id = Number(params[0]);
        const p = store.patients.find(pt => pt.id === id);
        return p ? [clone(p)] : [];
      }
      return clone(store.patients);
    }

    // DOCTORS lookup
    if (upper.includes('FROM DOCTORS')) {
      let docs = store.doctors.map(d => {
        const u = store.users.find(usr => usr.id === d.user_id) || {};
        return {
          ...clone(d),
          full_name: u.full_name,
          email: u.email,
          phone: u.phone
        };
      });

      if (upper.includes('USER_ID =')) {
        const uid = Number(params[0]);
        const doc = docs.find(d => d.user_id === uid);
        return doc ? [doc] : [];
      }
      if (upper.includes('D.ID =') || upper.includes('ID =')) {
        const id = Number(params[0]);
        const doc = docs.find(d => d.id === id);
        return doc ? [doc] : [];
      }
      return docs;
    }

    // DOCTOR AVAILABILITY
    if (upper.includes('FROM DOCTOR_AVAILABILITY')) {
      if (upper.includes('DOCTOR_ID =')) {
        const docId = Number(params[0]);
        let av = store.doctor_availability.filter(a => a.doctor_id === docId && a.is_active);
        if (upper.includes('DAY_OF_WEEK =')) {
          const day = Number(params[1]);
          av = av.filter(a => a.day_of_week === day);
        }
        return clone(av);
      }
      return clone(store.doctor_availability);
    }

    // APPOINTMENTS
    if (upper.includes('FROM APPOINTMENTS')) {
      let list = store.appointments.map(a => {
        const p = store.patients.find(pt => pt.id === a.patient_id) || {};
        const pUser = store.users.find(u => u.id === p.user_id) || {};
        const d = store.doctors.find(doc => doc.id === a.doctor_id) || {};
        const dUser = store.users.find(u => u.id === d.user_id) || {};
        const share = store.medical_record_shares.find(s => s.appointment_id === a.id && s.consent_status === 'granted');
        const summary = store.medical_summaries.find(s => s.appointment_id === a.id);
        const record = store.medical_records.find(r => r.appointment_id === a.id);

        return {
          ...clone(a),
          patient_name: pUser.full_name || 'Patient',
          patient_email: pUser.email || '',
          patient_phone: pUser.phone || '',
          doctor_name: dUser.full_name || 'Doctor',
          specialization: d.specialization || '',
          hospital_name: d.hospital_name || '',
          hospital_address: d.hospital_address || '',
          records_uploaded: !!record,
          summary_ready: summary ? summary.summary_status === 'ready' : false,
          consent_granted: !!share
        };
      });

      if (upper.includes('ID =')) {
        const id = Number(params[0]);
        const found = list.find(a => a.id === id);
        return found ? [found] : [];
      }
      if (upper.includes('APPOINTMENT_REFERENCE =')) {
        const ref = params[0];
        const found = list.find(a => a.appointment_reference === ref);
        return found ? [found] : [];
      }
      if (upper.includes('PATIENT_ID =')) {
        const pid = Number(params[0]);
        return list.filter(a => a.patient_id === pid);
      }
      if (upper.includes('DOCTOR_ID =')) {
        const did = Number(params[0]);
        return list.filter(a => a.doctor_id === did);
      }
      return list;
    }

    // MEDICAL RECORDS
    if (upper.includes('FROM MEDICAL_RECORDS')) {
      if (upper.includes('ID =')) {
        const id = Number(params[0]);
        const r = store.medical_records.find(rec => rec.id === id);
        return r ? [clone(r)] : [];
      }
      if (upper.includes('PATIENT_ID =')) {
        const pid = Number(params[0]);
        let recs = store.medical_records.filter(r => r.patient_id === pid);
        if (upper.includes('APPOINTMENT_ID =')) {
          const aid = Number(params[1]);
          recs = recs.filter(r => r.appointment_id === aid);
        }
        return clone(recs);
      }
      return clone(store.medical_records);
    }

    // MEDICAL SUMMARIES
    if (upper.includes('FROM MEDICAL_SUMMARIES')) {
      if (upper.includes('APPOINTMENT_ID =')) {
        const aid = Number(params[0]);
        const s = store.medical_summaries.find(sum => sum.appointment_id === aid);
        return s ? [clone(s)] : [];
      }
      if (upper.includes('PATIENT_ID =')) {
        const pid = Number(params[0]);
        const s = store.medical_summaries.find(sum => sum.patient_id === pid);
        return s ? [clone(s)] : [];
      }
      return clone(store.medical_summaries);
    }

    // MEDICAL RECORD SHARES
    if (upper.includes('FROM MEDICAL_RECORD_SHARES')) {
      if (upper.includes('APPOINTMENT_ID =')) {
        const aid = Number(params[0]);
        let shares = store.medical_record_shares.filter(s => s.appointment_id === aid);
        return clone(shares);
      }
      return clone(store.medical_record_shares);
    }

    // REVIEWS
    if (upper.includes('FROM REVIEWS')) {
      let revs = store.reviews.map(r => {
        const p = store.patients.find(pt => pt.id === r.patient_id) || {};
        const u = store.users.find(usr => usr.id === p.user_id) || {};
        return {
          ...clone(r),
          patient_name: u.full_name || 'Verified Patient'
        };
      });

      if (upper.includes('DOCTOR_ID =')) {
        const did = Number(params[0]);
        return revs.filter(r => r.doctor_id === did);
      }
      if (upper.includes('APPOINTMENT_ID =')) {
        const aid = Number(params[0]);
        const r = revs.find(rev => rev.appointment_id === aid);
        return r ? [r] : [];
      }
      return revs;
    }

    // ADMIN STATS
    if (upper.includes('COUNT(*)')) {
      return [{
        total_doctors: store.doctors.length,
        approved_doctors: store.doctors.filter(d => d.verification_status === 'approved').length,
        pending_doctors: store.doctors.filter(d => d.verification_status === 'pending').length,
        total_patients: store.patients.length,
        total_appointments: store.appointments.length
      }];
    }

    return [];
  }

  // 2. INSERT queries
  if (upper.startsWith('INSERT')) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (upper.includes('INTO USERS')) {
      const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
      const user = {
        id: newId,
        full_name: params[0],
        email: params[1],
        password_hash: params[2],
        phone: params[3],
        role: params[4] || 'patient',
        google_subject: params[5] || null,
        created_at: now,
        updated_at: now
      };
      store.users.push(user);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO PATIENTS')) {
      const newId = store.patients.length ? Math.max(...store.patients.map(p => p.id)) + 1 : 1;
      const patient = {
        id: newId,
        user_id: Number(params[0]),
        date_of_birth: params[1] || null,
        gender: params[2] || 'prefer_not_to_say',
        blood_group: params[3] || null,
        address: params[4] || null,
        emergency_contact: params[5] || null,
        created_at: now,
        updated_at: now
      };
      store.patients.push(patient);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO DOCTORS')) {
      const newId = store.doctors.length ? Math.max(...store.doctors.map(d => d.id)) + 1 : 1;
      const doctor = {
        id: newId,
        user_id: Number(params[0]),
        specialization: params[1],
        qualifications: params[2],
        experience_years: Number(params[3]) || 0,
        medical_license_number: params[4],
        biography: params[5] || '',
        consultation_fee: Number(params[6]) || 0,
        hospital_name: params[7],
        hospital_address: params[8],
        city: params[9],
        state: params[10],
        postal_code: params[11],
        hospital_phone: params[12] || null,
        verification_status: params[13] || 'pending',
        average_rating: 0.0,
        total_reviews: 0,
        created_at: now,
        updated_at: now
      };
      store.doctors.push(doctor);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO DOCTOR_AVAILABILITY')) {
      const newId = store.doctor_availability.length ? Math.max(...store.doctor_availability.map(a => a.id)) + 1 : 1;
      const av = {
        id: newId,
        doctor_id: Number(params[0]),
        day_of_week: Number(params[1]),
        start_time: params[2],
        end_time: params[3],
        slot_duration_minutes: Number(params[4]) || 30,
        break_start_time: params[5] || null,
        break_end_time: params[6] || null,
        is_active: 1
      };
      store.doctor_availability.push(av);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO APPOINTMENTS')) {
      const newId = store.appointments.length ? Math.max(...store.appointments.map(a => a.id)) + 1 : 1;
      const appt = {
        id: newId,
        appointment_reference: params[0],
        patient_id: Number(params[1]),
        doctor_id: Number(params[2]),
        appointment_datetime: params[3],
        appointment_end_datetime: params[4],
        consultation_fee: Number(params[5]) || 0,
        appointment_status: params[6] || 'confirmed',
        payment_status: params[7] || 'pending',
        patient_notes: params[8] || null,
        doctor_notes: null,
        cancellation_reason: null,
        created_at: now,
        updated_at: now
      };
      store.appointments.push(appt);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO MEDICAL_RECORDS')) {
      const newId = store.medical_records.length ? Math.max(...store.medical_records.map(r => r.id)) + 1 : 1;
      const rec = {
        id: newId,
        patient_id: Number(params[0]),
        appointment_id: params[1] ? Number(params[1]) : null,
        original_filename: params[2],
        stored_filename: params[3],
        mime_type: params[4] || 'application/pdf',
        file_size: Number(params[5]),
        extracted_text: params[6] || null,
        processing_status: params[7] || 'uploaded',
        error_message: null,
        uploaded_at: now
      };
      store.medical_records.push(rec);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO MEDICAL_SUMMARIES')) {
      const newId = store.medical_summaries.length ? Math.max(...store.medical_summaries.map(s => s.id)) + 1 : 1;
      const sum = {
        id: newId,
        patient_id: Number(params[0]),
        appointment_id: params[1] ? Number(params[1]) : null,
        summary_text: params[2],
        structured_json: typeof params[3] === 'object' ? params[3] : JSON.parse(params[3] || '{}'),
        summary_status: params[4] || 'ready',
        model_identifier: params[5] || 'mock-medical-ai',
        generated_at: now,
        updated_at: now
      };
      store.medical_summaries.push(sum);
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO MEDICAL_RECORD_SHARES')) {
      const newId = store.medical_record_shares.length ? Math.max(...store.medical_record_shares.map(s => s.id)) + 1 : 1;
      const share = {
        id: newId,
        patient_id: Number(params[0]),
        doctor_id: Number(params[1]),
        appointment_id: Number(params[2]),
        summary_id: params[3] ? Number(params[3]) : null,
        consent_status: params[4] || 'granted',
        consented_at: now,
        revoked_at: null
      };
      // Upsert
      const existingIdx = store.medical_record_shares.findIndex(s => s.appointment_id === share.appointment_id);
      if (existingIdx >= 0) {
        store.medical_record_shares[existingIdx] = share;
      } else {
        store.medical_record_shares.push(share);
      }
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO REVIEWS')) {
      const newId = store.reviews.length ? Math.max(...store.reviews.map(r => r.id)) + 1 : 1;
      const rev = {
        id: newId,
        appointment_id: Number(params[0]),
        patient_id: Number(params[1]),
        doctor_id: Number(params[2]),
        rating: Number(params[3]),
        review_text: params[4] || null,
        created_at: now,
        updated_at: now
      };
      store.reviews.push(rev);

      // Re-calculate doctor rating
      const docRevs = store.reviews.filter(r => r.doctor_id === rev.doctor_id);
      const avg = docRevs.reduce((acc, c) => acc + c.rating, 0) / docRevs.length;
      const doc = store.doctors.find(d => d.id === rev.doctor_id);
      if (doc) {
        doc.average_rating = parseFloat(avg.toFixed(2));
        doc.total_reviews = docRevs.length;
      }

      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO AUDIT_LOGS')) {
      const newId = store.audit_logs.length ? Math.max(...store.audit_logs.map(l => l.id)) + 1 : 1;
      store.audit_logs.push({
        id: newId,
        actor_user_id: params[0] ? Number(params[0]) : null,
        action: params[1],
        resource_type: params[2],
        resource_id: params[3],
        details: params[4] || null,
        ip_address: params[5] || '127.0.0.1',
        created_at: now
      });
      return { insertId: newId, affectedRows: 1 };
    }

    return { insertId: 1, affectedRows: 1 };
  }

  // 3. UPDATE queries
  if (upper.startsWith('UPDATE')) {
    if (upper.includes('DOCTORS')) {
      if (upper.includes('VERIFICATION_STATUS =')) {
        const status = params[0];
        const id = Number(params[1]);
        const doc = store.doctors.find(d => d.id === id);
        if (doc) {
          doc.verification_status = status;
          return { affectedRows: 1 };
        }
      }
      if (upper.includes('AVERAGE_RATING =')) {
        const rating = Number(params[0]);
        const reviewsCount = Number(params[1]);
        const id = Number(params[2]);
        const doc = store.doctors.find(d => d.id === id);
        if (doc) {
          doc.average_rating = rating;
          doc.total_reviews = reviewsCount;
          return { affectedRows: 1 };
        }
      }
    }

    if (upper.includes('APPOINTMENTS')) {
      if (upper.includes('APPOINTMENT_STATUS =')) {
        const status = params[0];
        let reason = null;
        let id;
        if (params.length === 3) {
          reason = params[1];
          id = Number(params[2]);
        } else {
          id = Number(params[1]);
        }
        const appt = store.appointments.find(a => a.id === id);
        if (appt) {
          appt.appointment_status = status;
          if (reason) appt.cancellation_reason = reason;
          return { affectedRows: 1 };
        }
      }
      if (upper.includes('DOCTOR_NOTES =')) {
        const notes = params[0];
        const id = Number(params[1]);
        const appt = store.appointments.find(a => a.id === id);
        if (appt) {
          appt.doctor_notes = notes;
          return { affectedRows: 1 };
        }
      }
    }

    if (upper.includes('MEDICAL_RECORDS')) {
      if (upper.includes('PROCESSING_STATUS =')) {
        const status = params[0];
        const text = params[1];
        const id = Number(params[2]);
        const rec = store.medical_records.find(r => r.id === id);
        if (rec) {
          rec.processing_status = status;
          if (text !== undefined) rec.extracted_text = text;
          return { affectedRows: 1 };
        }
      }
    }

    if (upper.includes('MEDICAL_RECORD_SHARES')) {
      if (upper.includes('CONSENT_STATUS =')) {
        const status = params[0];
        const apptId = Number(params[1]);
        const share = store.medical_record_shares.find(s => s.appointment_id === apptId);
        if (share) {
          share.consent_status = status;
          if (status === 'revoked') {
            share.revoked_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
          }
          return { affectedRows: 1 };
        }
      }
    }

    return { affectedRows: 1 };
  }

  // 4. DELETE queries
  if (upper.startsWith('DELETE')) {
    if (upper.includes('FROM MEDICAL_RECORDS')) {
      const id = Number(params[0]);
      const initial = store.medical_records.length;
      store.medical_records = store.medical_records.filter(r => r.id !== id);
      return { affectedRows: initial - store.medical_records.length };
    }
    if (upper.includes('FROM DOCTOR_AVAILABILITY')) {
      const docId = Number(params[0]);
      store.doctor_availability = store.doctor_availability.filter(a => a.doctor_id !== docId);
      return { affectedRows: 1 };
    }
    return { affectedRows: 1 };
  }

  return [];
}

/**
 * Get a connection from the pool (or simulated connection)
 */
async function getConnection() {
  if (!isFallbackMode) {
    try {
      const currentPool = getPool();
      if (currentPool) {
        return await currentPool.getConnection();
      }
    } catch (e) {
      isFallbackMode = true;
    }
  }

  // Mock connection with transaction support
  return {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, params) => [executeFallbackQuery(sql, params)],
    query: async (sql, params) => [executeFallbackQuery(sql, params)]
  };
}

/**
 * Test connectivity
 */
async function testConnection() {
  try {
    const currentPool = getPool();
    if (currentPool) {
      const [result] = await currentPool.query('SELECT 1 as connected');
      return { success: true, mode: 'mysql', result };
    }
  } catch (error) {
    return {
      success: true,
      mode: 'fallback_memory',
      note: 'Operating in self-contained In-Memory development database. MySQL is offline on localhost:3306.'
    };
  }
}

module.exports = {
  getPool,
  query,
  getConnection,
  testConnection
};
