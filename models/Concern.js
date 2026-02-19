const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Concern = sequelize.define('Concern', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_path: {
    type: DataTypes.STRING,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Concern;
