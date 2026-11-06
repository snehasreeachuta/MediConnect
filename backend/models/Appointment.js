const db = require('../config/db');

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
    const rows = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByReference(reference) {
    const rows = await db.query('SELECT * FROM appointments WHERE appointment_reference = ?', [reference]);
    return rows[0] || null;
  }

  static async findByPatientId(patientId) {
    return await db.query('SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_datetime DESC', [patientId]);
  }

  static async findByDoctorId(doctorId) {
    return await db.query('SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_datetime DESC', [doctorId]);
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
