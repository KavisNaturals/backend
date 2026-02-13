const { Order, OrderItem, Product } = require('../models');

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
      include: [{ model: OrderItem, include: [Product] }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
       include: [{ model: OrderItem, include: [Product] }],
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
      // Map status to appropriate fields
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
