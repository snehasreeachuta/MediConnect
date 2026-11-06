const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes require admin authorization
router.use(authenticate, authorize('admin'));

router.get('/doctors', adminController.getDoctorsForAdmin);
router.patch('/doctors/:id/approve', adminController.approveDoctor);
router.patch('/doctors/:id/reject', adminController.rejectDoctor);
router.patch('/doctors/:id/suspend', adminController.suspendDoctor);
router.get('/stats', adminController.getAdminStats);

module.exports = router;
