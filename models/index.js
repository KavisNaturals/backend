const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Banner = require('./Banner');
const Category = require('./Category');
const Concern = require('./Concern');
const Wishlist = require('./Wishlist');
const ContactMessage = require('./ContactMessage');
const UserAddress = require('./UserAddress');
const SiteSettings = require('./SiteSettings');
const PageContent = require('./PageContent');

// Associations
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Wishlist, { foreignKey: 'user_id' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Wishlist, { foreignKey: 'product_id' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(UserAddress, { foreignKey: 'user_id' });
UserAddress.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Review,
  Banner,
  Category,
  Concern,
  Wishlist,
  ContactMessage,
  UserAddress,
  SiteSettings,
  PageContent,
};
