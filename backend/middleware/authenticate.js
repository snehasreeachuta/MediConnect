const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in to proceed.', 401));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    // Attach user profile info
    req.user = user;

    if (user.role === 'patient') {
      const patientProfile = await User.getPatientProfileByUserId(user.id);
      req.patient = patientProfile;
    } else if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findByUserId(user.id);
      req.doctor = doctorProfile;
    }

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    next(err);
  }
}

module.exports = authenticate;
