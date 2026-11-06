const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', doctorController.getAllDoctors);
router.get('/specializations', doctorController.getSpecializations);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getDoctorAvailabilitySlots);

// Protected doctor routes
router.put('/profile', authenticate, authorize('doctor'), doctorController.updateDoctorProfile);
router.put('/availability', authenticate, authorize('doctor'), doctorController.updateAvailability);

module.exports = router;
