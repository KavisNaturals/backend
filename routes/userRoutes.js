

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const userController = require('../controllers/userController');

// Admin routes
router.get('/', auth, admin, userController.getAllUsers);

// User Profile routes
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);

module.exports = router;
