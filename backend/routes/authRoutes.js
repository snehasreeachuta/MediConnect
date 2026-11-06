const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/register/patient', authController.registerPatient);
router.post('/register/doctor', authController.registerDoctor);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
