const db = require('../config/db');

class MedicalRecord {
  static async create({
    patientId,
    doctorId = null,
    appointmentId = null,
    originalFilename,
    storedFilename,
    filePath = null,
    mimeType = 'application/pdf',
    fileSize,
    extractedText = null,
    processingStatus = 'uploaded'
  }) {
    const result = await db.query(
      `INSERT INTO medical_records (
        patient_id, doctor_id, appointment_id, original_filename, stored_filename,
        file_path, mime_type, file_size, extracted_text, processing_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, appointmentId, originalFilename, storedFilename, filePath, mimeType, fileSize, extractedText, processingStatus]
    );
    return result.insertId;
  }

  static async findById(id) {
    const rows = await db.query('SELECT * FROM medical_records WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByAppointmentId(appointmentId) {
    return await db.query('SELECT * FROM medical_records WHERE appointment_id = ? ORDER BY uploaded_at DESC', [appointmentId]);
  }

  static async findByDoctorId(doctorId) {
    return await db.query('SELECT * FROM medical_records WHERE doctor_id = ? ORDER BY uploaded_at DESC', [doctorId]);
  }

  static async findByPatientId(patientId, appointmentId = null) {
    let sql = 'SELECT * FROM medical_records WHERE patient_id = ?';
    const params = [patientId];
    if (appointmentId) {
      sql += ' AND appointment_id = ?';
      params.push(appointmentId);
    }
    sql += ' ORDER BY uploaded_at DESC';
    return await db.query(sql, params);
  }

  static async updateStatus(id, status, extractedText = null) {
    await db.query(
      'UPDATE medical_records SET processing_status = ?, extracted_text = ? WHERE id = ?',
      [status, extractedText, id]
    );
    return this.findById(id);
  }

  static async deleteById(id) {
    await db.query('DELETE FROM medical_records WHERE id = ?', [id]);
  }

  // Summaries
  static async createSummary({
    patientId,
    appointmentId = null,
    summaryText,
    structuredJson = {},
    summaryStatus = 'ready',
    modelIdentifier = 'gemini-1.5-flash'
  }) {
    const jsonStr = typeof structuredJson === 'string' ? structuredJson : JSON.stringify(structuredJson);
    const result = await db.query(
      `INSERT INTO medical_summaries (
        patient_id, appointment_id, summary_text, structured_json,
        summary_status, model_identifier
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, appointmentId, summaryText, jsonStr, summaryStatus, modelIdentifier]
    );
    return result.insertId;
  }

  static async getSummaryByAppointmentId(appointmentId) {
    const rows = await db.query('SELECT * FROM medical_summaries WHERE appointment_id = ?', [appointmentId]);
    return rows[0] || null;
  }

  static async getSummaryByPatientId(patientId) {
    return await db.query('SELECT * FROM medical_summaries WHERE patient_id = ? ORDER BY generated_at DESC', [patientId]);
  }

  // Consent & Sharing
  static async grantShareConsent({ patientId, doctorId, appointmentId, summaryId = null }) {
    const result = await db.query(
      `INSERT INTO medical_record_shares (
        patient_id, doctor_id, appointment_id, summary_id, consent_status
      ) VALUES (?, ?, ?, ?, 'granted')`,
      [patientId, doctorId, appointmentId, summaryId]
    );
    return result.insertId;
  }

  static async revokeShareConsent(appointmentId) {
    await db.query(
      "UPDATE medical_record_shares SET consent_status = ? WHERE appointment_id = ?",
      ['revoked', appointmentId]
    );
  }

  static async getShareConsent(appointmentId) {
    const rows = await db.query('SELECT * FROM medical_record_shares WHERE appointment_id = ?', [appointmentId]);
    return rows[0] || null;
  }

  static async checkDoctorAccess(doctorId, appointmentId) {
    const share = await this.getShareConsent(appointmentId);
    if (!share) return false;
    return share.doctor_id === Number(doctorId) && share.consent_status === 'granted';
  }
}

module.exports = MedicalRecord;
