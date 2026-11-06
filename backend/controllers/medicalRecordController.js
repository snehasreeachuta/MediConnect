const fs = require('fs');
const path = require('path');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const DocumentExtractionService = require('../services/documentExtractionService');
const MedicalSummaryService = require('../services/medicalSummaryService');
const FileStorageService = require('../services/fileStorageService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Upload Medical Record (PDF)
exports.uploadMedicalRecord = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select a PDF medical record document to upload.', 400));
  }

  const { appointmentId } = req.body;
  let patient = req.patient;
  if (!patient) {
    patient = await User.getPatientProfileByUserId(req.user.id);
  }

  if (!patient) {
    const patientId = await User.createPatientProfile({ userId: req.user.id });
    patient = { id: patientId, user_id: req.user.id };
  }

  let verifiedAppointmentId = null;
  if (appointmentId) {
    const appt = await Appointment.findById(Number(appointmentId));
    if (appt && appt.patient_id === patient.id) {
      verifiedAppointmentId = appt.id;
    }
  }

  // Create record in database
  const recordId = await MedicalRecord.create({
    patientId: patient.id,
    appointmentId: verifiedAppointmentId,
    originalFilename: req.file.originalname,
    storedFilename: req.file.filename,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    processingStatus: 'uploaded'
  });

  const record = await MedicalRecord.findById(recordId);

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'UPLOAD_MEDICAL_RECORD',
    resourceType: 'medical_records',
    resourceId: recordId,
    details: { originalFilename: req.file.originalname, appointmentId: verifiedAppointmentId },
    ipAddress: req.ip
  });

  // Automatically start background extraction and summarization
  try {
    const filePath = FileStorageService.getSafeFilePath(req.file.filename);
    const extraction = await DocumentExtractionService.extractPdfText(filePath);

    await MedicalRecord.updateStatus(recordId, 'processing', extraction.text);

    // Generate Structured AI Summary
    const summaryResult = await MedicalSummaryService.summarizeRecord(extraction.text, {
      fullName: req.user.full_name
    });

    const summaryId = await MedicalRecord.createSummary({
      patientId: patient.id,
      appointmentId: verifiedAppointmentId,
      summaryText: summaryResult.summaryText,
      structuredJson: summaryResult.structuredJson,
      summaryStatus: 'ready',
      modelIdentifier: summaryResult.modelUsed
    });

    await MedicalRecord.updateStatus(recordId, 'summary_ready', extraction.text);

    // If linked to an appointment, auto-grant initial consent or prepare share record
    if (verifiedAppointmentId) {
      const appt = await Appointment.findById(verifiedAppointmentId);
      if (appt) {
        await MedicalRecord.grantShareConsent({
          patientId: patient.id,
          doctorId: appt.doctor_id,
          appointmentId: appt.id,
          summaryId
        });
      }
    }
  } catch (procErr) {
    console.error('[MedicalRecord Upload Processing Warning]', procErr.message);
    await MedicalRecord.updateStatus(recordId, 'failed');
  }

  const updatedRecord = await MedicalRecord.findById(recordId);

  res.status(201).json({
    status: 'success',
    message: 'Medical document uploaded and processed successfully.',
    record: updatedRecord
  });
});

// 2. Get My Medical Records
exports.getMyMedicalRecords = asyncHandler(async (req, res, next) => {
  let patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient) {
    return res.status(200).json({ status: 'success', records: [] });
  }

  const { appointmentId } = req.query;
  const records = await MedicalRecord.findByPatientId(patient.id, appointmentId ? Number(appointmentId) : null);

  res.status(200).json({
    status: 'success',
    count: records.length,
    records
  });
});

// 3. Download / Stream Original Medical Record File (Strict Access Control)
exports.downloadRecordFile = asyncHandler(async (req, res, next) => {
  const recordId = Number(req.params.id);
  const record = await MedicalRecord.findById(recordId);

  if (!record) {
    return next(new AppError('Medical record not found.', 404));
  }

  // Access validation:
  // 1. Patient who owns the record
  // 2. Doctor assigned to appointment who has GRANTED consent
  // 3. Administrator
  let hasAccess = false;

  if (req.user.role === 'patient') {
    const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
    if (patient && patient.id === record.patient_id) {
      hasAccess = true;
    }
  } else if (req.user.role === 'doctor') {
    const doctor = req.doctor || await Doctor.findByUserId(req.user.id);
    if (doctor && record.appointment_id) {
      hasAccess = await MedicalRecord.checkDoctorAccess(doctor.id, record.appointment_id);
    }
  } else if (req.user.role === 'admin') {
    hasAccess = true;
  }

  if (!hasAccess) {
    await AuditLog.log({
      actorUserId: req.user.id,
      action: 'UNAUTHORIZED_RECORD_ACCESS_ATTEMPT',
      resourceType: 'medical_records',
      resourceId: recordId,
      ipAddress: req.ip
    });
    return next(new AppError('Access denied. You do not have authorization to view this medical document.', 403));
  }

  const filePath = FileStorageService.getSafeFilePath(record.stored_filename);
  if (!fs.existsSync(filePath)) {
    return next(new AppError('File not found in storage.', 404));
  }

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'DOWNLOAD_MEDICAL_RECORD',
    resourceType: 'medical_records',
    resourceId: recordId,
    ipAddress: req.ip
  });

  res.setHeader('Content-Type', record.mime_type || 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${record.original_filename}"`);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// 4. Delete Medical Record
exports.deleteMedicalRecord = asyncHandler(async (req, res, next) => {
  const recordId = Number(req.params.id);
  const record = await MedicalRecord.findById(recordId);

  if (!record) {
    return next(new AppError('Medical record not found.', 404));
  }

  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient || patient.id !== record.patient_id) {
    return next(new AppError('You can only delete your own medical records.', 403));
  }

  // Delete file from disk
  FileStorageService.deleteFile(record.stored_filename);

  // Delete DB record
  await MedicalRecord.deleteById(recordId);

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'DELETE_MEDICAL_RECORD',
    resourceType: 'medical_records',
    resourceId: recordId,
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Medical record deleted successfully.'
  });
});

// 5. Trigger or Retry AI Summarization
exports.summarizeRecord = asyncHandler(async (req, res, next) => {
  const recordId = Number(req.params.id);
  const record = await MedicalRecord.findById(recordId);

  if (!record) {
    return next(new AppError('Medical record not found.', 404));
  }

  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient || patient.id !== record.patient_id) {
    return next(new AppError('Access denied. You can only summarize your own records.', 403));
  }

  const filePath = FileStorageService.getSafeFilePath(record.stored_filename);
  await MedicalRecord.updateStatus(recordId, 'processing');

  const extraction = await DocumentExtractionService.extractPdfText(filePath);
  const summaryResult = await MedicalSummaryService.summarizeRecord(extraction.text, {
    fullName: req.user.full_name
  });

  const summaryId = await MedicalRecord.createSummary({
    patientId: patient.id,
    appointmentId: record.appointment_id,
    summaryText: summaryResult.summaryText,
    structuredJson: summaryResult.structuredJson,
    summaryStatus: 'ready',
    modelIdentifier: summaryResult.modelUsed
  });

  await MedicalRecord.updateStatus(recordId, 'summary_ready', extraction.text);

  res.status(200).json({
    status: 'success',
    message: 'Medical summary generated successfully.',
    summaryId,
    summaryText: summaryResult.summaryText,
    structured: summaryResult.structuredJson,
    isMock: summaryResult.isMock
  });
});

// 6. Get Medical Summary for an Appointment
exports.getAppointmentSummary = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  // Authorization check
  const isPatient = req.user.role === 'patient' && req.patient && req.patient.id === appointment.patient_id;
  const isDoctor = req.user.role === 'doctor' && req.doctor && req.doctor.id === appointment.doctor_id;
  const isAdmin = req.user.role === 'admin';

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new AppError('Access denied.', 403));
  }

  // If doctor, verify patient consent
  if (isDoctor) {
    const hasConsent = await MedicalRecord.checkDoctorAccess(req.doctor.id, appointmentId);
    if (!hasConsent) {
      return res.status(200).json({
        status: 'success',
        hasConsent: false,
        message: 'No medical records have been shared for this appointment.'
      });
    }
  }

  const summary = await MedicalRecord.getSummaryByAppointmentId(appointmentId);

  res.status(200).json({
    status: 'success',
    hasConsent: true,
    summary: summary || null,
    message: summary ? 'Summary retrieved.' : 'No summary ready for this appointment.'
  });
});

// 7. Patient Consent: Share Summary with Doctor
exports.shareConsent = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient || patient.id !== appointment.patient_id) {
    return next(new AppError('Only the patient of this appointment can authorize record sharing.', 403));
  }

  await MedicalRecord.grantShareConsent({
    patientId: patient.id,
    doctorId: appointment.doctor_id,
    appointmentId: appointment.id
  });

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'GRANT_MEDICAL_RECORD_SHARE_CONSENT',
    resourceType: 'medical_record_shares',
    resourceId: appointment.id,
    details: { doctorId: appointment.doctor_id },
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Medical records and summary shared with doctor successfully.'
  });
});

// 8. Patient Consent: Revoke Access
exports.revokeConsent = asyncHandler(async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient || patient.id !== appointment.patient_id) {
    return next(new AppError('Only the patient can revoke consent.', 403));
  }

  await MedicalRecord.revokeShareConsent(appointment.id);

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'REVOKE_MEDICAL_RECORD_SHARE_CONSENT',
    resourceType: 'medical_record_shares',
    resourceId: appointment.id,
    details: { doctorId: appointment.doctor_id },
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Doctor access to medical records for this appointment has been revoked.'
  });
});
