const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const db = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const AuditLog = require('../models/AuditLog');
const { verifyGoogleIdToken } = require('../services/googleAuthService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// 1. Patient Registration
exports.registerPatient = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, confirmPassword, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError('Full name, email address, and password are required.', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match.', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  // Check duplicate email
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create User
  const userId = await User.create({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    phone: phone ? phone.trim() : null,
    role: 'patient'
  });

  // Create Patient Profile
  const patientId = await User.createPatientProfile({
    userId,
    dateOfBirth: dateOfBirth || null,
    gender: gender || 'prefer_not_to_say',
    bloodGroup: bloodGroup || null,
    address: address || null,
    emergencyContact: emergencyContact || null
  });

  const user = await User.findById(userId);
  const token = generateToken(user);

  await AuditLog.log({
    actorUserId: userId,
    action: 'REGISTER_PATIENT',
    resourceType: 'users',
    resourceId: userId,
    ipAddress: req.ip
  });

  res.status(201).json({
    status: 'success',
    message: 'Patient registration successful.',
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      patientId
    }
  });
});

// 2. Doctor Registration
exports.registerDoctor = asyncHandler(async (req, res, next) => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    phone,
    specialization,
    qualifications,
    experienceYears,
    medicalLicenseNumber,
    biography,
    consultationFee,
    hospitalName,
    hospitalAddress,
    city,
    state,
    postalCode,
    hospitalPhone,
    availability // Array of { day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time }
  } = req.body;

  // Validation
  if (!fullName || !email || !password || !specialization || !qualifications || !medicalLicenseNumber || !hospitalName || !hospitalAddress || !city || !state || !postalCode) {
    return next(new AppError('Please fill in all required personal, professional, and clinic fields.', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match.', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  // Check duplicate email
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  // Check duplicate license
  const existingLicense = await Doctor.findByLicenseNumber(medicalLicenseNumber);
  if (existingLicense) {
    return next(new AppError('A doctor with this medical license number is already registered.', 409));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create User
  const userId = await User.create({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    phone: phone ? phone.trim() : null,
    role: 'doctor'
  });

  // Create Doctor record with 'pending' verification status
  const doctorId = await Doctor.create({
    userId,
    specialization: specialization.trim(),
    qualifications: qualifications.trim(),
    experienceYears: Number(experienceYears) || 0,
    medicalLicenseNumber: medicalLicenseNumber.trim(),
    biography: biography ? biography.trim() : '',
    consultationFee: Number(consultationFee) || 0,
    hospitalName: hospitalName.trim(),
    hospitalAddress: hospitalAddress.trim(),
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    hospitalPhone: hospitalPhone ? hospitalPhone.trim() : null,
    verificationStatus: 'pending' // Mandatory requirement
  });

  // Save initial availability if provided
  if (Array.isArray(availability) && availability.length > 0) {
    await DoctorAvailability.setAvailability(doctorId, availability);
  } else {
    // Default Mon-Fri 09:00 - 17:00
    const defaultSlots = [1, 2, 3, 4, 5].map(day => ({
      day_of_week: day,
      start_time: '09:00:00',
      end_time: '17:00:00',
      slot_duration_minutes: 30,
      break_start_time: '13:00:00',
      break_end_time: '14:00:00'
    }));
    await DoctorAvailability.setAvailability(doctorId, defaultSlots);
  }

  const user = await User.findById(userId);
  const token = generateToken(user);

  await AuditLog.log({
    actorUserId: userId,
    action: 'REGISTER_DOCTOR',
    resourceType: 'doctors',
    resourceId: doctorId,
    details: { medicalLicenseNumber, verificationStatus: 'pending' },
    ipAddress: req.ip
  });

  res.status(201).json({
    status: 'success',
    message: 'Doctor registration submitted successfully. Your credentials are under review by an administrator before appearing in search.',
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      doctorId,
      verificationStatus: 'pending'
    }
  });
});

// 3. User Login (Email / Password)
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, requestedRole } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400));
  }

  const user = await User.findByEmail(email);
  if (!user || !user.password_hash) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // Check role match if frontend specified
  if (requestedRole && user.role !== requestedRole) {
    return next(new AppError(`This account is registered as a ${user.role}, not a ${requestedRole}. Please use the ${user.role} sign-in option.`, 403));
  }

  let profile = null;
  if (user.role === 'patient') {
    profile = await User.getPatientProfileByUserId(user.id);
  } else if (user.role === 'doctor') {
    profile = await Doctor.findByUserId(user.id);
  }

  const token = generateToken(user);

  await AuditLog.log({
    actorUserId: user.id,
    action: 'LOGIN_EMAIL',
    resourceType: 'users',
    resourceId: user.id,
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile
    }
  });
});

// 4. Google Sign-In
exports.googleAuth = asyncHandler(async (req, res, next) => {
  const { idToken, targetRole = 'patient' } = req.body;

  const payload = await verifyGoogleIdToken(idToken);
  let user = await User.findByGoogleSubject(payload.googleId);

  if (!user) {
    // Check if user with same email exists
    user = await User.findByEmail(payload.email);
    if (user) {
      // User exists with email - link Google Subject
      user.google_subject = payload.googleId;
      await db.query('UPDATE users SET google_subject = ? WHERE id = ?', [payload.googleId, user.id]);
    } else {
      // Create new user with server-controlled role
      const safeRole = targetRole === 'doctor' ? 'doctor' : 'patient';
      const newUserId = await User.create({
        fullName: payload.name || 'Google User',
        email: payload.email,
        passwordHash: null,
        phone: null,
        role: safeRole,
        googleSubject: payload.googleId
      });

      if (safeRole === 'patient') {
        await User.createPatientProfile({ userId: newUserId });
      } else {
        // Create provisional doctor profile pending verification
        await Doctor.create({
          userId: newUserId,
          specialization: 'General Medicine',
          qualifications: 'Credentials Pending Submission',
          experienceYears: 0,
          medicalLicenseNumber: `GOOGLE-PROV-${Date.now()}`,
          biography: 'Provisional Google Sign-in profile. Complete verification details.',
          consultationFee: 100.0,
          hospitalName: 'Clinic Pending',
          hospitalAddress: 'Address Pending',
          city: 'City',
          state: 'State',
          postalCode: '00000',
          verificationStatus: 'pending'
        });
      }

      user = await User.findById(newUserId);
    }
  }

  let profile = null;
  if (user.role === 'patient') {
    profile = await User.getPatientProfileByUserId(user.id);
  } else if (user.role === 'doctor') {
    profile = await Doctor.findByUserId(user.id);
  }

  const token = generateToken(user);

  await AuditLog.log({
    actorUserId: user.id,
    action: 'LOGIN_GOOGLE',
    resourceType: 'users',
    resourceId: user.id,
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Google authentication successful.',
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile
    }
  });
});

// 5. Get Current Authenticated User (GET /api/auth/me)
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    user: {
      id: req.user.id,
      fullName: req.user.full_name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      profile: req.patient || req.doctor || null
    }
  });
});
