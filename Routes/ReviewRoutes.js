const express = require('express');
const router = express.Router();
const ReviewController = require('../Controllers/ReviewController');

// Define routes for reviews
router.post('/', ReviewController.createReview);
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);
router.put('/:id', ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);

module.exports = router;
