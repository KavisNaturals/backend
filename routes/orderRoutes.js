const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getMyOrders);
router.get('/track', orderController.trackOrder); // Public track by orderId + email
router.get('/all', auth, admin, orderController.getAllOrders); // Admin route
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/status', auth, admin, orderController.updateOrderStatus);

module.exports = router;
