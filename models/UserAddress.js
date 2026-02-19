const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAddress = sequelize.define('UserAddress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  flat_house_no: {
    type: DataTypes.STRING,
  },
  area_street: {
    type: DataTypes.STRING,
  },
  landmark: {
    type: DataTypes.STRING,
  },
  pincode: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'India',
  },
  phone: {
    type: DataTypes.STRING,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = UserAddress;
