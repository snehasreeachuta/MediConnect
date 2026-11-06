const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return rows[0] || null;
  }

  static async findById(id) {
    const rows = await db.query('SELECT id, full_name, email, phone, role, google_subject, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByGoogleSubject(googleSubject) {
    const rows = await db.query('SELECT * FROM users WHERE google_subject = ?', [googleSubject]);
    return rows[0] || null;
  }

  static async create({ fullName, email, passwordHash = null, phone = null, role = 'patient', googleSubject = null }) {
    const result = await db.query(
      'INSERT INTO users (full_name, email, password_hash, phone, role, google_subject) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email.toLowerCase().trim(), passwordHash, phone, role, googleSubject]
    );
    return result.insertId;
  }

  static async createPatientProfile({ userId, dateOfBirth = null, gender = 'prefer_not_to_say', bloodGroup = null, address = null, emergencyContact = null }) {
    const result = await db.query(
      'INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, dateOfBirth, gender, bloodGroup, address, emergencyContact]
    );
    return result.insertId;
  }

  static async getPatientProfileByUserId(userId) {
    const rows = await db.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
    return rows[0] || null;
  }

  static async getPatientProfileById(patientId) {
    const rows = await db.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    return rows[0] || null;
  }

  static async updatePatientProfile(userId, { dateOfBirth, gender, bloodGroup, address, emergencyContact }) {
    await db.query(
      'UPDATE patients SET date_of_birth = ?, gender = ?, blood_group = ?, address = ?, emergency_contact = ? WHERE user_id = ?',
      [dateOfBirth, gender, bloodGroup, address, emergencyContact, userId]
    );
    return this.getPatientProfileByUserId(userId);
  }
}

module.exports = User;
