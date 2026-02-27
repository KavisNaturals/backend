const { Order, OrderItem, Product, User } = require('../models');
const emailService = require('../services/emailService');

exports.createOrder = async (req, res) => {
  try {
    const { items, total_amount, shipping_address, razorpay_order_id, razorpay_payment_id } = req.body;
    const userId = req.user ? req.user.id : null;

    const order = await Order.create({
      user_id: userId,
      total_amount,
      shipping_address,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      payment_status: razorpay_payment_id ? 'paid' : 'pending',
    });

    const emailItems = [];
    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        variant_label: item.variant_label || null,
      });
      // Deduct stock — variant-level or product-level
      const product = await Product.findByPk(item.product_id);
      if (item.variant_label) {
        if (product) {
          const opts = Array.isArray(product.options) ? product.options : [];
          const updatedOpts = opts.map(opt =>
            opt.label === item.variant_label
              ? { ...opt, stock: Math.max(0, (Number(opt.stock) || 0) - item.quantity) }
              : opt
          );
          await product.update({ options: updatedOpts });
        }
      } else {
        await Product.decrement('stock', { by: item.quantity, where: { id: item.product_id } });
      }
      // Build enriched item for email
      emailItems.push({
        name: product
          ? (item.variant_label ? `${product.name} (${item.variant_label})` : product.name)
          : `Product`,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Send confirmation email
    try {
      const user = userId ? await User.findByPk(userId) : null;
      if (user) {
        await emailService.sendOrderConfirmation(order, user, emailItems);
      }
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, include: [Product] }, { model: User, attributes: ['id', 'name', 'email'] }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only allow owner or admin
    if (req.user && order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Public track order endpoint — requires order ID + email
exports.trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId || !email) {
      return res.status(400).json({ message: 'orderId and email are required' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'image_path'] }] },
        { model: User, attributes: ['id', 'email'] }
      ],
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify email matches
    if (!order.User || order.User.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(404).json({ message: 'Order not found or email does not match' });
    }

    res.json({
      id: order.id,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      delivery_status: order.delivery_status,
      shipping_address: order.shipping_address,
      createdAt: order.createdAt,
      items: order.OrderItems?.map(oi => ({
        name: oi.Product?.name || 'Product',
        image_path: oi.Product?.image_path,
        quantity: oi.quantity,
        price: oi.price,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking order', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
       include: [
         { model: OrderItem, include: [Product] },
         { model: User, attributes: ['id', 'name', 'email'] }
       ],
       order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

const VALID_DELIVERY_STATUSES = ['pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'returned'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, delivery_status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updateData = {};

    if (delivery_status) {
      if (!VALID_DELIVERY_STATUSES.includes(delivery_status)) {
        return res.status(400).json({ message: `Invalid delivery status. Must be one of: ${VALID_DELIVERY_STATUSES.join(', ')}` });
      }
      updateData.delivery_status = delivery_status;
    }

    if (status) {
      if (VALID_PAYMENT_STATUSES.includes(status)) {
        updateData.payment_status = status;
      } else if (VALID_DELIVERY_STATUSES.includes(status)) {
        updateData.delivery_status = status;
      } else {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }
    }

    // Capture previous status BEFORE updating
    const prevDeliveryStatus = order.delivery_status;

    await order.update(updateData);

    // Restore stock when order is cancelled or returned (only first time)
    const RESTORE_STATUSES = ['cancelled', 'returned'];
    if (
      updateData.delivery_status &&
      RESTORE_STATUSES.includes(updateData.delivery_status) &&
      !RESTORE_STATUSES.includes(prevDeliveryStatus)
    ) {
      try {
        const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
        for (const item of orderItems) {
          if (item.variant_label) {
            const product = await Product.findByPk(item.product_id);
            if (product) {
              const opts = Array.isArray(product.options) ? product.options : [];
              const updatedOpts = opts.map(opt =>
                opt.label === item.variant_label
                  ? { ...opt, stock: (Number(opt.stock) || 0) + item.quantity }
                  : opt
              );
              await product.update({ options: updatedOpts });
            }
          } else {
            await Product.increment('stock', { by: item.quantity, where: { id: item.product_id } });
          }
        }
      } catch (stockErr) {
        console.error('Stock restoration failed:', stockErr.message);
      }
    }

    // Send status update email if delivery_status changed
    if (updateData.delivery_status) {
      try {
        const user = order.user_id ? await User.findByPk(order.user_id) : null;
        if (user) {
          await emailService.sendStatusUpdate(order, user);
        }
      } catch (emailErr) {
        console.error('Status update email failed:', emailErr.message);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

