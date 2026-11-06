const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Get All Approved Doctors (Search / Filter)
exports.getAllDoctors = asyncHandler(async (req, res, next) => {
  const { specialization, city, minFee, maxFee, minRating, search } = req.query;

  const doctors = await Doctor.findAllApproved({
    specialization,
    city,
    minFee,
    maxFee,
    minRating,
    search
  });

  res.status(200).json({
    status: 'success',
    count: doctors.length,
    doctors
  });
});

// 2. Get Doctor By ID
exports.getDoctorById = asyncHandler(async (req, res, next) => {
  const doctorId = Number(req.params.id);
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(new AppError('Doctor not found.', 404));
  }

  // Non-approved doctors can only be viewed by themselves or an admin
  if (doctor.verification_status !== 'approved') {
    if (!req.user || (req.user.role !== 'admin' && doctor.user_id !== req.user.id)) {
      return next(new AppError('This doctor profile is currently pending verification.', 403));
    }
  }

  const availability = await DoctorAvailability.findByDoctorId(doctorId);
  const reviews = await Review.findByDoctorId(doctorId);

  res.status(200).json({
    status: 'success',
    doctor: {
      ...doctor,
      availability,
      reviews
    }
  });
});

// 3. Get Doctor Available Time Slots for a Specific Date
exports.getDoctorAvailabilitySlots = asyncHandler(async (req, res, next) => {
  const doctorId = Number(req.params.id);
  const { date } = req.query; // format: YYYY-MM-DD

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return next(new AppError('Please provide a valid date parameter in YYYY-MM-DD format.', 400));
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || doctor.verification_status !== 'approved') {
    return next(new AppError('Doctor not found or not approved to accept appointments.', 404));
  }

  // Parse Day of Week (0=Sun, 1=Mon, ..., 6=Sat)
  const targetDate = new Date(`${date}T00:00:00`);
  const dayOfWeek = targetDate.getDay();

  const dayConfig = await DoctorAvailability.findByDoctorAndDay(doctorId, dayOfWeek);
  if (!dayConfig || !dayConfig.is_active) {
    return res.status(200).json({
      status: 'success',
      date,
      dayOfWeek,
      isWorkingDay: false,
      availableSlots: [],
      message: 'The doctor is not scheduled to work on this day.'
    });
  }

  // Fetch already occupied appointments on this date
  const bookedAppointments = await Appointment.getDoctorOccupiedSlots(doctorId, date);

  // Generate slots from start_time to end_time with duration slot_duration_minutes
  const slots = [];
  const duration = dayConfig.slot_duration_minutes || 30;

  const [startHour, startMin] = dayConfig.start_time.split(':').map(Number);
  const [endHour, endMin] = dayConfig.end_time.split(':').map(Number);

  let currentMin = startHour * 60 + startMin;
  const endLimitMin = endHour * 60 + endMin;

  let breakStart = -1;
  let breakEnd = -1;
  if (dayConfig.break_start_time && dayConfig.break_end_time) {
    const [bsh, bsm] = dayConfig.break_start_time.split(':').map(Number);
    const [beh, bem] = dayConfig.break_end_time.split(':').map(Number);
    breakStart = bsh * 60 + bsm;
    breakEnd = beh * 60 + bem;
  }

  while (currentMin + duration <= endLimitMin) {
    // Check if slot falls in break
    const slotEndMin = currentMin + duration;
    const isBreak = breakStart >= 0 && currentMin < breakEnd && slotEndMin > breakStart;

    if (!isBreak) {
      const hStr = String(Math.floor(currentMin / 60)).padStart(2, '0');
      const mStr = String(currentMin % 60).padStart(2, '0');
      const timeStr = `${hStr}:${mStr}:00`;
      const fullStartDatetime = `${date} ${timeStr}`;

      const endHStr = String(Math.floor(slotEndMin / 60)).padStart(2, '0');
      const endMStr = String(slotEndMin % 60).padStart(2, '0');
      const fullEndDatetime = `${date} ${endHStr}:${endMStr}:00`;

      // Check if slot conflicts with an existing booking
      const isBooked = bookedAppointments.some(a => {
        const apptStart = a.appointment_datetime.slice(11, 16);
        return apptStart === `${hStr}:${mStr}`;
      });

      slots.push({
        time: `${hStr}:${mStr}`,
        startDatetime: fullStartDatetime,
        endDatetime: fullEndDatetime,
        isAvailable: !isBooked
      });
    }

    currentMin += duration;
  }

  res.status(200).json({
    status: 'success',
    date,
    dayOfWeek,
    isWorkingDay: true,
    slotDurationMinutes: duration,
    availableSlots: slots
  });
});

// 4. Update Doctor Profile (Self)
exports.updateDoctorProfile = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findByUserId(req.user.id);
  if (!doctor) {
    return next(new AppError('Doctor profile not found.', 404));
  }

  const { biography, consultationFee, hospitalName, hospitalAddress, city, state, postalCode, hospitalPhone } = req.body;

  // Update in DB
  const db = require('../config/db');
  await db.query(
    `UPDATE doctors SET
      biography = COALESCE(?, biography),
      consultation_fee = COALESCE(?, consultation_fee),
      hospital_name = COALESCE(?, hospital_name),
      hospital_address = COALESCE(?, hospital_address),
      city = COALESCE(?, city),
      state = COALESCE(?, state),
      postal_code = COALESCE(?, postal_code),
      hospital_phone = COALESCE(?, hospital_phone)
    WHERE id = ?`,
    [biography, consultationFee, hospitalName, hospitalAddress, city, state, postalCode, hospitalPhone, doctor.id]
  );

  const updated = await Doctor.findById(doctor.id);

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    doctor: updated
  });
});

// 5. Update Doctor Availability (Self)
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findByUserId(req.user.id);
  if (!doctor) {
    return next(new AppError('Doctor profile not found.', 404));
  }

  const { availability } = req.body;
  if (!Array.isArray(availability)) {
    return next(new AppError('Availability must be an array of schedule items.', 400));
  }

  // Prevent doctors from deleting an availability slot that silently conflicts with an already confirmed appointment
  const updatedSlots = await DoctorAvailability.setAvailability(doctor.id, availability);

  res.status(200).json({
    status: 'success',
    message: 'Availability schedule updated successfully.',
    availability: updatedSlots
  });
});

// 6. Get List of Medical Specializations
exports.getSpecializations = asyncHandler(async (req, res, next) => {
  const specs = await Doctor.getSpecializations();
  res.status(200).json({
    status: 'success',
    specializations: specs
  });
});
