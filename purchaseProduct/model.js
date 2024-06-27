const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseProduct = sequelize.define('PurchaseProduct', {
  purchaseId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Purchases',
      key: 'id',
    },
    field: 'purchaseId',
  },
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Products',
      key: 'id',
    },
    field: 'productId',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = PurchaseProduct;
