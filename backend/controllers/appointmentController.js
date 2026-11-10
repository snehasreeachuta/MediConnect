const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Create Appointment (Booking)
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, appointmentDatetime, patientNotes } = req.body;

  if (!doctorId || !appointmentDatetime) {
    return next(new AppError('Doctor ID and appointment date/time are required.', 400));
  }

  // Ensure patient profile exists
  let patient = req.patient;
  if (!patient) {
    patient = await User.getPatientProfileByUserId(req.user.id);
    if (!patient) {
      const patientId = await User.createPatientProfile({ userId: req.user.id });
      patient = { id: patientId, user_id: req.user.id };
    }
  }

  // Verify doctor exists and is approved
  const doctor = await Doctor.findById(Number(doctorId));
  if (!doctor || doctor.verification_status !== 'approved') {
    return next(new AppError('The selected doctor is not available for appointments.', 404));
  }

  // Validate appointment is in the future
  const startDt = new Date(appointmentDatetime);
  if (isNaN(startDt.getTime()) || startDt.getTime() <= Date.now()) {
    return next(new AppError('Appointment date and time must be in the future.', 400));
  }

  // Calculate 30-minute end time
  const endDt = new Date(startDt.getTime() + 30 * 60 * 1000);
  const startStr = startDt.toISOString().slice(0, 19).replace('T', ' ');
  const endStr = endDt.toISOString().slice(0, 19).replace('T', ' ');

  // Prevent double booking with server-side conflict check & locking
  const hasConflict = await Appointment.checkSlotConflict(doctor.id, startStr, endStr);
  if (hasConflict) {
    return next(new AppError('This time slot has already been booked. Please choose another available slot.', 409));
  }

  // Generate unique appointment reference (e.g. MC-8B39F2)
  const uniqueSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const appointmentReference = `MC-${uniqueSuffix}`;

  const appointmentId = await Appointment.create({
    appointmentReference,
    patientId: patient.id,
    doctorId: doctor.id,
    appointmentDatetime: startStr,
    appointmentEndDatetime: endStr,
    consultationFee: doctor.consultation_fee,
    appointmentStatus: 'confirmed',
    paymentStatus: 'pending',
    patientNotes: patientNotes ? patientNotes.trim() : null
  });

  const createdAppointment = await Appointment.findById(appointmentId);

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'CREATE_APPOINTMENT',
    resourceType: 'appointments',
    resourceId: appointmentId,
    details: { appointmentReference, doctorId: doctor.id, startDatetime: startStr },
    ipAddress: req.ip
  });

  res.status(201).json({
    status: 'success',
    message: 'Appointment booked successfully.',
    appointment: {
      ...createdAppointment,
      doctor_name: doctor.full_name || 'Dr. Specialist',
      specialization: doctor.specialization,
      hospital_name: doctor.hospital_name,
      hospital_address: doctor.hospital_address
    }
  });
});

// 2. Get My Appointments (Patient or Doctor)
exports.getMyAppointments = asyncHandler(async (req, res, next) => {
  let appointments = [];

  if (req.user.role === 'patient') {
    let patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
    if (patient) {
      appointments = await Appointment.findByPatientId(patient.id);
    }
  } else if (req.user.role === 'doctor') {
    let doctor = req.doctor || await Doctor.findByUserId(req.user.id);
    if (doctor) {
      appointments = await Appointment.findByDoctorId(doctor.id);
    }
  } else if (req.user.role === 'admin') {
    // Admin sees all
    appointments = await Appointment.findByPatientId(0); // fallback all
  }

  res.status(200).json({
    status: 'success',
    count: appointments.length,
    appointments
  });
});

// 3. Get Appointment Details By ID
exports.getAppointmentById = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  // Authorization check: User must be the patient, doctor, or admin
  const isPatient = req.user.role === 'patient' && req.patient && req.patient.id === appointment.patient_id;
  const isDoctor = req.user.role === 'doctor' && req.doctor && req.doctor.id === appointment.doctor_id;
  const isAdmin = req.user.role === 'admin';

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new AppError('Access denied. You are not authorized to view this appointment.', 403));
  }

  // Check consent for medical summary & records
  const share = await MedicalRecord.getShareConsent(appointment.id);
  const hasConsent = share && share.consent_status === 'granted';

  let summary = null;
  let medicalRecords = [];

  // Summary is accessible to the patient, or to the doctor IF consent is granted
  if (isPatient || (isDoctor && hasConsent) || isAdmin) {
    summary = await MedicalRecord.getSummaryByAppointmentId(appointment.id);
    if (!summary) {
      // check if patient has a general summary
      const patientSummaries = await MedicalRecord.getSummaryByPatientId(appointment.patient_id);
      if (patientSummaries.length > 0) summary = patientSummaries[0];
    }

    // Original documents: check appointment-linked records first
    medicalRecords = await MedicalRecord.findByPatientId(appointment.patient_id, appointment.id);
    if (medicalRecords.length === 0) {
      // Check records linked directly to this doctor
      const docRecords = await MedicalRecord.findByDoctorId(appointment.doctor_id);
      medicalRecords = docRecords.filter(r => r.patient_id === appointment.patient_id);
    }
    if (medicalRecords.length === 0 && (hasConsent || isPatient)) {
      // Fallback to patient's general records if authorized
      medicalRecords = await MedicalRecord.findByPatientId(appointment.patient_id);
    }
  }

  res.status(200).json({
    status: 'success',
    appointment: {
      ...appointment,
      hasConsent,
      summary,
      medicalRecords: medicalRecords.map(r => ({
        id: r.id,
        originalFilename: r.original_filename,
        storedFilename: r.stored_filename,
        filePath: r.file_path || `uploads/${r.stored_filename}`,
        mimeType: r.mime_type,
        fileSize: r.file_size,
        processingStatus: r.processing_status,
        uploadedAt: r.uploaded_at
      }))
    }
  });
});

// 4. Cancel Appointment
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const { cancellationReason } = req.body;
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  const isPatient = req.user.role === 'patient' && req.patient && req.patient.id === appointment.patient_id;
  const isDoctor = req.user.role === 'doctor' && req.doctor && req.doctor.id === appointment.doctor_id;
  const isAdmin = req.user.role === 'admin';

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new AppError('You do not have permission to cancel this appointment.', 403));
  }

  if (appointment.appointment_status === 'completed') {
    return next(new AppError('Completed appointments cannot be cancelled.', 400));
  }

  const updated = await Appointment.updateStatus(appointmentId, 'cancelled', cancellationReason || 'Cancelled by user');

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'CANCEL_APPOINTMENT',
    resourceType: 'appointments',
    resourceId: appointmentId,
    details: { cancellationReason },
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Appointment cancelled successfully.',
    appointment: updated
  });
});

// 5. Update Status (Doctor or Admin)
exports.updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const { status, doctorNotes } = req.body; // 'confirmed', 'completed', 'rejected', 'cancelled'
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  const isDoctor = req.user.role === 'doctor' && req.doctor && req.doctor.id === appointment.doctor_id;
  const isAdmin = req.user.role === 'admin';

  if (!isDoctor && !isAdmin) {
    return next(new AppError('Only the assigned doctor or an administrator can update appointment status.', 403));
  }

  // Clinical Rule: "Doctors must not be able to mark an appointment completed before the appointment occurs."
  if (status === 'completed') {
    const apptTime = new Date(appointment.appointment_datetime).getTime();
    if (Date.now() < apptTime) {
      return next(new AppError('Cannot mark appointment as completed before its scheduled appointment time.', 400));
    }
  }

  const updated = await Appointment.updateStatus(appointmentId, status);
  if (doctorNotes) {
    await Appointment.updateDoctorNotes(appointmentId, doctorNotes);
  }

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'UPDATE_APPOINTMENT_STATUS',
    resourceType: 'appointments',
    resourceId: appointmentId,
    details: { status },
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: `Appointment status updated to ${status}.`,
    appointment: updated
  });
});

// 6. Save Private Doctor Notes
exports.saveDoctorNotes = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const { doctorNotes } = req.body;
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  const isDoctor = req.user.role === 'doctor' && req.doctor && req.doctor.id === appointment.doctor_id;
  if (!isDoctor && req.user.role !== 'admin') {
    return next(new AppError('Only the assigned doctor can record private consultation notes.', 403));
  }

  const updated = await Appointment.updateDoctorNotes(appointmentId, doctorNotes);

  res.status(200).json({
    status: 'success',
    message: 'Doctor consultation notes saved securely.',
    appointment: updated
  });
});
