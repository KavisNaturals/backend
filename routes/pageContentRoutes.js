const express = require('express');
const router = express.Router();
const pageContentController = require('../controllers/pageContentController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public
router.get('/:slug', pageContentController.getPage);

// Admin
router.get('/', authMiddleware, adminMiddleware, pageContentController.getAllPages);
router.put('/:slug', authMiddleware, adminMiddleware, pageContentController.updatePage);

module.exports = router;
