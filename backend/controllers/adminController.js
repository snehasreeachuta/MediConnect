const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Get All Doctors for Admin Verification Review
exports.getDoctorsForAdmin = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.getAllForAdmin();
  res.status(200).json({
    status: 'success',
    count: doctors.length,
    doctors
  });
});

// 2. Approve Doctor Verification
exports.approveDoctor = asyncHandler(async (req, res, next) => {
  const doctorId = Number(req.params.id);
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(new AppError('Doctor not found.', 404));
  }

  const updated = await Doctor.updateVerificationStatus(doctorId, 'approved');

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'ADMIN_APPROVE_DOCTOR',
    resourceType: 'doctors',
    resourceId: doctorId,
    details: { medicalLicenseNumber: doctor.medical_license_number },
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: `Doctor ${doctor.full_name || 'Dr. ' + doctor.id} has been approved and is now active in search.`,
    doctor: updated
  });
});

// 3. Reject Doctor Verification
exports.rejectDoctor = asyncHandler(async (req, res, next) => {
  const doctorId = Number(req.params.id);
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(new AppError('Doctor not found.', 404));
  }

  const updated = await Doctor.updateVerificationStatus(doctorId, 'rejected');

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'ADMIN_REJECT_DOCTOR',
    resourceType: 'doctors',
    resourceId: doctorId,
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Doctor application rejected.',
    doctor: updated
  });
});

// 4. Suspend Doctor
exports.suspendDoctor = asyncHandler(async (req, res, next) => {
  const doctorId = Number(req.params.id);
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(new AppError('Doctor not found.', 404));
  }

  const updated = await Doctor.updateVerificationStatus(doctorId, 'suspended');

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'ADMIN_SUSPEND_DOCTOR',
    resourceType: 'doctors',
    resourceId: doctorId,
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Doctor account has been suspended.',
    doctor: updated
  });
});

// 5. Get System Dashboard Statistics
exports.getAdminStats = asyncHandler(async (req, res, next) => {
  const stats = await Appointment.getAdminStatistics();
  res.status(200).json({
    status: 'success',
    stats
  });
});
