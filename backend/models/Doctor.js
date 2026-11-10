const db = require('../config/db');

class Doctor {
  static async findAllApproved(filters = {}) {
    const { specialization, city, minFee, maxFee, minRating, search } = filters;
    let doctors = await db.query(`
      SELECT d.*, u.full_name, u.email, u.phone 
      FROM doctors d 
      JOIN users u ON u.id = d.user_id
    `);
    
    // Filter approved only for public directory
    let list = doctors.filter(d => d.verification_status === 'approved');

    if (specialization) {
      list = list.filter(d => (d.specialization || '').toLowerCase() === specialization.toLowerCase());
    }
    if (city) {
      list = list.filter(d => (d.city || '').toLowerCase().includes(city.toLowerCase()));
    }
    if (minFee !== undefined && !isNaN(minFee)) {
      list = list.filter(d => Number(d.consultation_fee) >= Number(minFee));
    }
    if (maxFee !== undefined && !isNaN(maxFee)) {
      list = list.filter(d => Number(d.consultation_fee) <= Number(maxFee));
    }
    if (minRating !== undefined && !isNaN(minRating)) {
      list = list.filter(d => Number(d.average_rating) >= Number(minRating));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => 
        (d.full_name || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q) ||
        (d.hospital_name || '').toLowerCase().includes(q) ||
        (d.city || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  static async findById(id) {
    const rows = await db.query(`
      SELECT d.*, u.full_name, u.email, u.phone 
      FROM doctors d 
      JOIN users u ON u.id = d.user_id 
      WHERE d.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const rows = await db.query(`
      SELECT d.*, u.full_name, u.email, u.phone 
      FROM doctors d 
      JOIN users u ON u.id = d.user_id 
      WHERE d.user_id = ?
    `, [userId]);
    return rows[0] || null;
  }

  static async findByLicenseNumber(licenseNumber) {
    const doctors = await db.query(`
      SELECT d.*, u.full_name, u.email, u.phone 
      FROM doctors d 
      JOIN users u ON u.id = d.user_id
    `);
    return doctors.find(d => (d.medical_license_number || '').toLowerCase() === licenseNumber.toLowerCase().trim()) || null;
  }

  static async create({
    userId,
    specialization,
    qualifications,
    experienceYears,
    medicalLicenseNumber,
    biography = '',
    consultationFee,
    hospitalName,
    hospitalAddress,
    city,
    state,
    postalCode,
    hospitalPhone = null,
    verificationStatus = 'pending'
  }) {
    const result = await db.query(
      `INSERT INTO doctors (
        user_id, specialization, qualifications, experience_years, medical_license_number,
        biography, consultation_fee, hospital_name, hospital_address, city, state, postal_code,
        hospital_phone, verification_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, specialization, qualifications, experienceYears, medicalLicenseNumber,
        biography, consultationFee, hospitalName, hospitalAddress, city, state, postalCode,
        hospitalPhone, verificationStatus
      ]
    );
    return result.insertId;
  }

  static async updateVerificationStatus(id, status) {
    await db.query('UPDATE doctors SET verification_status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }

  static async updateRating(id, averageRating, totalReviews) {
    await db.query('UPDATE doctors SET average_rating = ?, total_reviews = ? WHERE id = ?', [averageRating, totalReviews, id]);
  }

  static async getAllForAdmin() {
    return await db.query('SELECT * FROM doctors');
  }

  static async getSpecializations() {
    const docs = await db.query('SELECT * FROM doctors');
    const specs = new Set();
    docs.filter(d => d.verification_status === 'approved').forEach(d => {
      if (d.specialization) specs.add(d.specialization);
    });
    return Array.from(specs);
  }
}

module.exports = Doctor;
