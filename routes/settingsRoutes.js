const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const settingsController = require('../controllers/settingsController');

// Public: get specific setting by key (e.g. social_links)
router.get('/:key', settingsController.get);

// Admin: get all settings
router.get('/', auth, admin, settingsController.getAll);

// Admin: update a setting
router.put('/:key', auth, admin, settingsController.update);

module.exports = router;
