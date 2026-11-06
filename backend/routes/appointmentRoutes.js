const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const medicalRecordController = require('../controllers/medicalRecordController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/', authenticate, authorize('patient'), appointmentController.createAppointment);
router.get('/my', authenticate, appointmentController.getMyAppointments);
router.get('/:id', authenticate, appointmentController.getAppointmentById);
router.patch('/:id/cancel', authenticate, appointmentController.cancelAppointment);
router.patch('/:id/status', authenticate, authorize('doctor', 'admin'), appointmentController.updateAppointmentStatus);
router.patch('/:id/notes', authenticate, authorize('doctor', 'admin'), appointmentController.saveDoctorNotes);

// Medical summary & patient sharing consent attached to appointment
router.get('/:id/summary', authenticate, medicalRecordController.getAppointmentSummary);
router.post('/:id/summary/share', authenticate, authorize('patient'), medicalRecordController.shareConsent);
router.post('/:id/summary/revoke', authenticate, authorize('patient'), medicalRecordController.revokeConsent);

module.exports = router;
