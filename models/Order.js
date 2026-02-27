const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true, // Allow guest checkout or handle properly
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending',
  },
  delivery_status: {
    type: DataTypes.ENUM('pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'returned'),
    defaultValue: 'processing',
  },
  razorpay_order_id: {
    type: DataTypes.STRING,
  },
  razorpay_payment_id: {
    type: DataTypes.STRING,
  },
  shipping_address: {
    type: DataTypes.JSON, // Or TEXT if simpler
  },
});

module.exports = Order;
