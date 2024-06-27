const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  lotNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Product.associate = (models) => {
  Product.belongsToMany(models.Purchase, {
    through: models.PurchaseProduct,
    as: 'purchases',
    foreignKey: 'productId',
    otherKey: 'purchaseId',
  });
};

module.exports = Product;
