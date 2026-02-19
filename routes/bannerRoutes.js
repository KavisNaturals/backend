const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public
router.get('/', bannerController.getActiveBanners);

// Admin only
router.get('/all', auth, admin, bannerController.getAllBanners);
router.post('/', auth, admin, bannerController.createBanner);
router.put('/:id', auth, admin, bannerController.updateBanner);
router.delete('/:id', auth, admin, bannerController.deleteBanner);

module.exports = router;
