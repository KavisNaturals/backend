

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');

// Admin routes
router.get('/', auth, admin, userController.getAllUsers);

// User Profile routes
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);
router.post('/profile/avatar', auth, userController.uploadAvatarMiddleware, userController.updateAvatar);

// User Address routes
router.get('/address', auth, addressController.getAddress);
router.post('/address', auth, addressController.saveAddress);
router.put('/address/:id', auth, addressController.updateAddress);
router.delete('/address/:id', auth, addressController.deleteAddress);

module.exports = router;
