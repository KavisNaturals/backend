const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  product_description: {
    type: DataTypes.TEXT,
  },
  size: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0,
  },
  reviews_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING,
  },
  image_path: {
    type: DataTypes.STRING,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  before_after_image: {
    type: DataTypes.STRING,
  },
  benefits: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  ingredients: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  direction: {
    type: DataTypes.TEXT,
  },
  options: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  // Virtual getter so frontend can use imagePath
  getterMethods: {
    imagePath() {
      const path = this.getDataValue('image_path');
      if (!path) return '/images/placeholder.png';
      if (path.startsWith('http') || path.startsWith('/')) return path;
      return `/uploads/${path}`;
    },
    beforeAfterImage1() {
      const path = this.getDataValue('before_after_image');
      if (!path) return null;
      if (path.startsWith('http') || path.startsWith('/')) return path;
      return `/uploads/${path}`;
    },
    productDescription() {
      return this.getDataValue('product_description') || this.getDataValue('description');
    },
  },
  toJSON() {
    const values = Object.assign({}, this.get());
    // Add virtual fields to JSON output
    values.imagePath = this.imagePath;
    values.beforeAfterImage1 = this.beforeAfterImage1;
    values.productDescription = this.productDescription;
    return values;
  },
});

module.exports = Product;
