// Standalone top-level reviews routes (e.g., /api/reviews/featured)
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// GET /api/reviews/featured
router.get('/featured', reviewController.getFeaturedReviews);

// Admin:
router.get('/', auth, admin, reviewController.getAllReviews);
router.post('/', auth, admin, reviewController.adminCreateReview);
router.put('/:id', auth, admin, reviewController.adminUpdateReview);
router.delete('/:id', auth, admin, reviewController.deleteReview);

module.exports = router;
