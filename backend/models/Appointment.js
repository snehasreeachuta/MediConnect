const db = require('../config/db');

const APPOINTMENT_SELECT_SQL = `
  SELECT a.*,
         u_p.full_name AS patient_name, u_p.email AS patient_email, u_p.phone AS patient_phone,
         u_d.full_name AS doctor_name, d.specialization, d.hospital_name, d.hospital_address,
         EXISTS(SELECT 1 FROM medical_records mr WHERE mr.appointment_id = a.id) AS records_uploaded,
         EXISTS(SELECT 1 FROM medical_summaries ms WHERE ms.appointment_id = a.id AND ms.summary_status = 'ready') AS summary_ready,
         EXISTS(SELECT 1 FROM medical_record_shares mrs WHERE mrs.appointment_id = a.id AND mrs.consent_status = 'granted') AS consent_granted
  FROM appointments a
  LEFT JOIN patients p ON p.id = a.patient_id
  LEFT JOIN users u_p ON u_p.id = p.user_id
  LEFT JOIN doctors d ON d.id = a.doctor_id
  LEFT JOIN users u_d ON u_d.id = d.user_id
`;

class Appointment {
  static async create({
    appointmentReference,
    patientId,
    doctorId,
    appointmentDatetime,
    appointmentEndDatetime,
    consultationFee,
    appointmentStatus = 'confirmed',
    paymentStatus = 'pending',
    patientNotes = null
  }) {
    const result = await db.query(
      `INSERT INTO appointments (
        appointment_reference, patient_id, doctor_id, appointment_datetime,
        appointment_end_datetime, consultation_fee, appointment_status,
        payment_status, patient_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentReference, patientId, doctorId, appointmentDatetime,
        appointmentEndDatetime, consultationFee, appointmentStatus,
        paymentStatus, patientNotes
      ]
    );
    return result.insertId;
  }

  static async findById(id) {
    const rows = await db.query(APPOINTMENT_SELECT_SQL + ' WHERE a.id = ?', [id]);
    return rows[0] || null;
  }

  static async findByReference(reference) {
    const rows = await db.query(APPOINTMENT_SELECT_SQL + ' WHERE a.appointment_reference = ?', [reference]);
    return rows[0] || null;
  }

  static async findByPatientId(patientId) {
    if (patientId > 0) {
      return await db.query(APPOINTMENT_SELECT_SQL + ' WHERE a.patient_id = ? ORDER BY a.appointment_datetime DESC', [patientId]);
    }
    return await db.query(APPOINTMENT_SELECT_SQL + ' ORDER BY a.appointment_datetime DESC');
  }

  static async findByDoctorId(doctorId) {
    return await db.query(APPOINTMENT_SELECT_SQL + ' WHERE a.doctor_id = ? ORDER BY a.appointment_datetime DESC', [doctorId]);
  }

  static async checkSlotConflict(doctorId, startDatetime, endDatetime, excludeId = null) {
    const rows = await db.query('SELECT * FROM appointments WHERE doctor_id = ?', [doctorId]);
    const requestedStart = new Date(startDatetime).getTime();
    const requestedEnd = new Date(endDatetime).getTime();

    const conflict = rows.find(a => {
      if (excludeId && a.id === excludeId) return false;
      if (a.appointment_status === 'cancelled' || a.appointment_status === 'rejected') return false;

      const apptStart = new Date(a.appointment_datetime).getTime();
      const apptEnd = new Date(a.appointment_end_datetime).getTime();

      // Overlap condition: start < apptEnd && end > apptStart
      return requestedStart < apptEnd && requestedEnd > apptStart;
    });

    return !!conflict;
  }

  static async updateStatus(id, status, cancellationReason = null) {
    await db.query(
      'UPDATE appointments SET appointment_status = ?, cancellation_reason = ? WHERE id = ?',
      [status, cancellationReason, id]
    );
    return this.findById(id);
  }

  static async updateDoctorNotes(id, doctorNotes) {
    await db.query('UPDATE appointments SET doctor_notes = ? WHERE id = ?', [doctorNotes, id]);
    return this.findById(id);
  }

  static async getDoctorOccupiedSlots(doctorId, dateStr) {
    const rows = await db.query('SELECT * FROM appointments WHERE doctor_id = ?', [doctorId]);
    return rows.filter(a => {
      if (a.appointment_status === 'cancelled' || a.appointment_status === 'rejected') return false;
      const apptDate = a.appointment_datetime.slice(0, 10);
      return apptDate === dateStr;
    });
  }

  static async getAdminStatistics() {
    const stats = await db.query('SELECT COUNT(*) FROM appointments');
    return stats[0] || {};
  }
}

module.exports = Appointment;
