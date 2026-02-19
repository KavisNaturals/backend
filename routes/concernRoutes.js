const express = require('express');
const router = express.Router();
const concernController = require('../controllers/concernController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public
router.get('/', concernController.getActiveConcerns);

// Admin only
router.get('/all', auth, admin, concernController.getAllConcerns);
router.post('/', auth, admin, concernController.createConcern);
router.put('/:id', auth, admin, concernController.updateConcern);
router.delete('/:id', auth, admin, concernController.deleteConcern);

module.exports = router;
