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
  image_url: {
    type: DataTypes.STRING,
    comment: 'Full URL from /api/upload, e.g. https://api.kavisnaturals.cloud/uploads/<file>',
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
  // SEO fields
  meta_title: {
    type: DataTypes.STRING,
  },
  meta_description: {
    type: DataTypes.TEXT,
  },
  meta_keywords: {
    type: DataTypes.STRING,
  },
}, {
  // Virtual getter so frontend can use imagePath
  getterMethods: {
    imagePath() {
      // Prefer the full URL stored via upload API
      const url = this.getDataValue('image_url');
      if (url) return url;
      const path = this.getDataValue('image_path');
      if (!path) return '/images/placeholder.svg';
      if (path.startsWith('http') || path.startsWith('/')) return path;
      return `https://api.kavisnaturals.cloud/uploads/${path}`;
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
    values.imageUrl = this.imagePath; // alias so frontend gets consistent field
    values.beforeAfterImage1 = this.beforeAfterImage1;
    values.productDescription = this.productDescription;
    return values;
  },
});

module.exports = Product;
