
const { Order, Product, User, OrderItem } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

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
      include: [{ model: User, attributes: ['name', 'email'] }]
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

exports.getSalesChart = async (req, res) => {
  try {
    const now = new Date();

    // --- Daily: last 30 days ---
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'orders'],
        [fn('SUM', col('total_amount')), 'revenue'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    // Fill zeros for missing days
    const dailyMap = {};
    dailyOrders.forEach(r => { dailyMap[r.date] = r; });
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      daily.push({
        label,
        date: key,
        orders: parseInt(dailyMap[key]?.orders || 0),
        revenue: parseFloat(dailyMap[key]?.revenue || 0),
      });
    }

    // --- Monthly: last 12 months ---
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'orders'],
        [fn('SUM', col('total_amount')), 'revenue'],
      ],
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true,
    }).catch(async () => {
      // PostgreSQL fallback
      return Order.findAll({
        where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
        attributes: [
          [fn('TO_CHAR', col('createdAt'), 'YYYY-MM'), 'month'],
          [fn('COUNT', col('id')), 'orders'],
          [fn('SUM', col('total_amount')), 'revenue'],
        ],
        group: [fn('TO_CHAR', col('createdAt'), 'YYYY-MM')],
        order: [[fn('TO_CHAR', col('createdAt'), 'YYYY-MM'), 'ASC']],
        raw: true,
      });
    });

    const monthlyMap = {};
    monthlyOrders.forEach(r => { monthlyMap[r.month] = r; });
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthly.push({
        label,
        month: key,
        orders: parseInt(monthlyMap[key]?.orders || 0),
        revenue: parseFloat(monthlyMap[key]?.revenue || 0),
      });
    }

    res.json({ daily, monthly });
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ message: 'Error fetching sales chart', error: error.message });
  }
};
