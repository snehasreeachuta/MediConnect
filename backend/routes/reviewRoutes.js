const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/', authenticate, authorize('patient'), reviewController.createReview);
router.get('/doctor/:id', reviewController.getDoctorReviews);
router.put('/:id', authenticate, authorize('patient'), reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
