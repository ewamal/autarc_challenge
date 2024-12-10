const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Customer = require('./Customer')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  User,
  Customer,
};

module.exports = db;
