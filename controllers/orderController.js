const { Order, OrderItem, Product, User } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    const { items, total_amount, shipping_address } = req.body;
    const userId = req.user ? req.user.id : null; // Handle guest if needed

    const order = await Order.create({
      user_id: userId,
      total_amount,
      shipping_address,
      payment_status: 'pending'
    });

    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      });
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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, delivery_status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const updateData = {};
    if (status) {
      if (['pending', 'paid', 'failed'].includes(status)) {
        updateData.payment_status = status;
      } else if (['processing', 'shipped', 'delivered'].includes(status)) {
        updateData.delivery_status = status;
      }
    }
    if (delivery_status) {
      updateData.delivery_status = delivery_status;
    }
    
    await order.update(updateData);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

