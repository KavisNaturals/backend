// Standalone top-level reviews routes (e.g., /api/reviews/featured)
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET /api/reviews/featured
router.get('/featured', reviewController.getFeaturedReviews);

module.exports = router;
