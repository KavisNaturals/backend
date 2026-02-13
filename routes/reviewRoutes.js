
const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for accessing :productId from parent router if nested
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

router.get('/', reviewController.getProductReviews);
router.post('/', auth, reviewController.addReview);

module.exports = router;
