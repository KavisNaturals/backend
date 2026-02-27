
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/stats', auth, admin, dashboardController.getStats);
router.get('/sales-chart', auth, admin, dashboardController.getSalesChart);

module.exports = router;
