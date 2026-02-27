const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-order', paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);
// Webhook: use express.raw so we can verify signature with raw body
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
