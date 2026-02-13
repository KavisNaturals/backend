
const { Order, Product, User, OrderItem } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalUsers = await User.count({ where: { role: 'user' } });
    
    const orders = await Order.findAll();
    const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total_amount), 0);

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: OrderItem }] 
    });

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalSales: totalSales.toFixed(2),
      recentOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
