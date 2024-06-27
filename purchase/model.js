const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../user/model');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

Purchase.associate = (models) => {
  Purchase.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  Purchase.belongsToMany(models.Product, {
    through: models.PurchaseProduct,
    as: 'products',
    foreignKey: 'purchaseId',
    otherKey: 'productId',
  });
};

module.exports = Purchase;
