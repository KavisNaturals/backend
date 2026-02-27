const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PageContent = sequelize.define('PageContent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  indexes: [{ unique: true, fields: ['slug'] }],
});

module.exports = PageContent;
