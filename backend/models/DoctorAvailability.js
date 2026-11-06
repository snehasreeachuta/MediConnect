const db = require('../config/db');

class DoctorAvailability {
  static async findByDoctorId(doctorId) {
    return await db.query(
      'SELECT * FROM doctor_availability WHERE doctor_id = ? AND is_active = 1 ORDER BY day_of_week ASC',
      [doctorId]
    );
  }

  static async findByDoctorAndDay(doctorId, dayOfWeek) {
    const rows = await db.query(
      'SELECT * FROM doctor_availability WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1',
      [doctorId, dayOfWeek]
    );
    return rows[0] || null;
  }

  static async setAvailability(doctorId, slots) {
    // Delete existing active slots for this doctor
    await db.query('DELETE FROM doctor_availability WHERE doctor_id = ?', [doctorId]);

    for (const slot of slots) {
      await db.query(
        `INSERT INTO doctor_availability (
          doctor_id, day_of_week, start_time, end_time, slot_duration_minutes,
          break_start_time, break_end_time, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          doctorId,
          slot.day_of_week,
          slot.start_time,
          slot.end_time,
          slot.slot_duration_minutes || 30,
          slot.break_start_time || null,
          slot.break_end_time || null
        ]
      );
    }

    return this.findByDoctorId(doctorId);
  }
}

module.exports = DoctorAvailability;
