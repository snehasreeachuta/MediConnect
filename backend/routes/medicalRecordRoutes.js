const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { upload } = require('../middleware/uploadValidation');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/upload', authenticate, authorize('patient'), upload.single('file'), medicalRecordController.uploadMedicalRecord);
router.get('/my', authenticate, authorize('patient'), medicalRecordController.getMyMedicalRecords);
router.get('/:id/download', authenticate, medicalRecordController.downloadRecordFile);
router.delete('/:id', authenticate, authorize('patient'), medicalRecordController.deleteMedicalRecord);
router.post('/:id/summarize', authenticate, authorize('patient'), medicalRecordController.summarizeRecord);

module.exports = router;
