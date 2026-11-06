const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Submit Review (Patient only for completed appointment)
exports.createReview = asyncHandler(async (req, res, next) => {
  const { appointmentId, rating, reviewText } = req.body;

  if (!appointmentId || !rating) {
    return next(new AppError('Appointment ID and rating (1-5) are required.', 400));
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return next(new AppError('Rating must be an integer between 1 and 5.', 400));
  }

  const appointment = await Appointment.findById(Number(appointmentId));
  if (!appointment) {
    return next(new AppError('Appointment not found.', 404));
  }

  // Ensure current user is the patient of this appointment
  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient || patient.id !== appointment.patient_id) {
    return next(new AppError('You can only review appointments that you attended.', 403));
  }

  // Ensure appointment is completed
  if (appointment.appointment_status !== 'completed') {
    return next(new AppError('Reviews can only be submitted after the appointment is marked as completed.', 400));
  }

  // Ensure patient hasn't already submitted a review for this appointment
  const existingReview = await Review.findByAppointmentId(appointment.id);
  if (existingReview) {
    return next(new AppError('You have already submitted a review for this appointment.', 409));
  }

  // Create review
  const reviewId = await Review.create({
    appointmentId: appointment.id,
    patientId: patient.id,
    doctorId: appointment.doctor_id,
    rating: numRating,
    reviewText: reviewText ? reviewText.trim() : null
  });

  // Re-calculate doctor's average rating from stored reviews
  const allDoctorReviews = await Review.findByDoctorId(appointment.doctor_id);
  const total = allDoctorReviews.length;
  const sum = allDoctorReviews.reduce((acc, r) => acc + Number(r.rating), 0);
  const newAverage = parseFloat((sum / total).toFixed(2));

  await Doctor.updateRating(appointment.doctor_id, newAverage, total);

  await AuditLog.log({
    actorUserId: req.user.id,
    action: 'CREATE_REVIEW',
    resourceType: 'reviews',
    resourceId: reviewId,
    details: { doctorId: appointment.doctor_id, rating: numRating },
    ipAddress: req.ip
  });

  res.status(201).json({
    status: 'success',
    message: 'Thank you for submitting your review.',
    reviewId,
    doctorRating: newAverage,
    totalReviews: total
  });
});

// 2. Get Doctor Reviews
exports.getDoctorReviews = asyncHandler(async (req, res, next) => {
  const doctorId = Number(req.params.id);
  const reviews = await Review.findByDoctorId(doctorId);

  res.status(200).json({
    status: 'success',
    count: reviews.length,
    reviews
  });
});

// 3. Update Review (Patient self only)
exports.updateReview = asyncHandler(async (req, res, next) => {
  const reviewId = Number(req.params.id);
  const { rating, reviewText } = req.body;

  const db = require('../config/db');
  const rows = await db.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
  const review = rows[0];

  if (!review) {
    return next(new AppError('Review not found.', 404));
  }

  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  if (!patient || patient.id !== review.patient_id) {
    return next(new AppError('You do not have permission to edit this review.', 403));
  }

  const numRating = Number(rating) || review.rating;
  await Review.update(reviewId, numRating, reviewText !== undefined ? reviewText : review.review_text);

  // Recalculate doctor rating
  const allDoctorReviews = await Review.findByDoctorId(review.doctor_id);
  const total = allDoctorReviews.length;
  const sum = allDoctorReviews.reduce((acc, r) => acc + Number(r.rating), 0);
  const newAverage = parseFloat((sum / total).toFixed(2));
  await Doctor.updateRating(review.doctor_id, newAverage, total);

  res.status(200).json({
    status: 'success',
    message: 'Review updated successfully.'
  });
});

// 4. Delete Review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const reviewId = Number(req.params.id);
  const db = require('../config/db');
  const rows = await db.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
  const review = rows[0];

  if (!review) {
    return next(new AppError('Review not found.', 404));
  }

  const patient = req.patient || await User.getPatientProfileByUserId(req.user.id);
  const isOwner = patient && patient.id === review.patient_id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You do not have permission to delete this review.', 403));
  }

  await Review.delete(reviewId);

  // Recalculate doctor rating
  const allDoctorReviews = await Review.findByDoctorId(review.doctor_id);
  const total = allDoctorReviews.length;
  const newAverage = total > 0 ? parseFloat((allDoctorReviews.reduce((acc, r) => acc + Number(r.rating), 0) / total).toFixed(2)) : 0.00;
  await Doctor.updateRating(review.doctor_id, newAverage, total);

  res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully.'
  });
});
