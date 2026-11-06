const db = require('../config/db');

class Review {
  static async create({ appointmentId, patientId, doctorId, rating, reviewText = null }) {
    const result = await db.query(
      `INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, review_text)
       VALUES (?, ?, ?, ?, ?)`,
      [appointmentId, patientId, doctorId, rating, reviewText]
    );
    return result.insertId;
  }

  static async findByAppointmentId(appointmentId) {
    const rows = await db.query('SELECT * FROM reviews WHERE appointment_id = ?', [appointmentId]);
    return rows[0] || null;
  }

  static async findByDoctorId(doctorId) {
    return await db.query('SELECT * FROM reviews WHERE doctor_id = ? ORDER BY created_at DESC', [doctorId]);
  }

  static async update(id, rating, reviewText) {
    await db.query(
      'UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?',
      [rating, reviewText, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
  }
}

module.exports = Review;
