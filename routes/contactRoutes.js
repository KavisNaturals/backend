const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public
router.post('/', contactController.submitContact);

// Admin only
router.get('/', auth, admin, contactController.getAllMessages);
router.put('/:id/read', auth, admin, contactController.markAsRead);

module.exports = router;
