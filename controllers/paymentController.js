const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { Order, OrderItem, Product, User } = require('../models');
const emailService = require('../services/emailService');

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
      
    if (expectedSignature === razorpay_signature) {
       res.json({ status: 'success', message: 'Payment verified' });
    } else {
       res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

/**
 * Razorpay Webhook — called by Razorpay server for async payment events
 * Route must use express.raw() to get raw body for signature verification
 */
exports.webhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body; // raw Buffer (from express.raw)

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'payment.captured') {
      const { order_id: razorpay_order_id, id: razorpay_payment_id } = event.payload.payment.entity;

      // Find our order by razorpay_order_id
      const order = await Order.findOne({ where: { razorpay_order_id } });
      if (order && order.payment_status !== 'paid') {
        await order.update({
          payment_status: 'paid',
          razorpay_payment_id,
        });

        // Deduct stock for each item
        const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
        for (const item of orderItems) {
          await Product.decrement('stock', { by: item.quantity, where: { id: item.product_id } });
        }

        // Send confirmation email
        try {
          const user = order.user_id ? await User.findByPk(order.user_id) : null;
          if (user) {
            const itemsData = orderItems.map(oi => ({
              product_id: oi.product_id,
              name: 'Product',
              quantity: oi.quantity,
              price: oi.price,
            }));
            await emailService.sendOrderConfirmation(order, user, itemsData);
          }
        } catch (emailErr) {
          console.error('Webhook email error:', emailErr.message);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ message: 'Webhook processing error', error: error.message });
  }
};
