const { Op } = require('sequelize');
const User = require('../user/model');
const Purchase = require('../purchase/model');
const Product = require('../product/model');
const PurchaseProduct = require('../purchaseProduct/model');
const sequelize = require('../config/database');
const { SUCCESS } = require('../constants/httpCodes');
const logger = require('../utils/logger');

const {
  InternalServerError,
  ConflictError,
  NotFound,
} = require('../utils/customErrors');

const createPurchase = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { products, purchaseDate } = req.body;
    const userId = req.user.id;

    let totalAmount = 0;
    for (const product of products) {
      const prod = await Product.findByPk(product.productId);
      if (prod) {
        if (prod.availableQuantity < product.quantity) {
          next(
            new ConflictError(`Insufficient stock for product ${prod.name}`),
          );
        }
        totalAmount += prod.price * product.quantity;

        prod.availableQuantity -= product.quantity;
        await prod.save({ transaction });
      } else {
        next(NotFound(`Product with ID ${product.productId} not found`));
      }
    }

    const purchase = await Purchase.create(
      {
        userId,
        purchaseDate: purchaseDate || new Date(),
        totalAmount,
      },
      { transaction },
    );

    const purchaseProducts = products.map((product) => ({
      purchaseId: purchase.id,
      productId: product.productId,
      quantity: product.quantity,
    }));

    await PurchaseProduct.bulkCreate(purchaseProducts, { transaction });

    await transaction.commit();
    res.status(SUCCESS.OK.status).json(purchase);
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    next(new InternalServerError());
  }
};

const getPurchases = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const purchases = await Purchase.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity'] },
        },
      ],
    });

    const formattedPurchases = purchases.map((purchase) => ({
      id: purchase.id,
      purchaseDate: purchase.purchaseDate,
      totalAmount: purchase.totalAmount,
      products: purchase.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.PurchaseProduct.quantity,
      })),
    }));

    res.status(SUCCESS.OK.status).json(formattedPurchases);
  } catch (error) {
    logger.log(error);
    next(InternalServerError());
  }
};

const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity'] },
        },
        { model: User, as: 'user', attributes: ['username'] },
      ],
    });
    if (!purchase) {
      next(new NotFound('Purchase not found'));
    }

    const formattedPurchase = {
      id: purchase.id,
      purchaseDate: purchase.purchaseDate,
      totalAmount: purchase.totalAmount,
      user: {
        id: purchase.user.id,
        username: purchase.user.username,
      },
      products: purchase.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.PurchaseProduct.quantity,
      })),
    };

    res.status(SUCCESS.OK.status).json(formattedPurchase);
  } catch (error) {
    logger.error(error);
    next(new InternalServerError());
  }
};

const getAdminPurchases = async (req, res, next) => {
  try {
    const {
      userId,
      productId,
      username,
      productName,
      page = 1,
      limit = 10,
    } = req.query;
    const offset = (page - 1) * limit;

    const userWhereClause = {};

    if (username) {
      userWhereClause.username = { [Op.like]: `%${username}%` };
    }

    const productWhereClause = {};
    if (productName) {
      productWhereClause.name = { [Op.like]: `%${productName}%` };
    }

    const whereClause = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const includeClause = [
      {
        model: User,
        as: 'user',
        attributes: ['username'],
        where: userWhereClause,
      },
      {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity'] },
        ...(productId && {
          where: {
            id: productId,
          },
        }),
      },
    ];

    const purchases = await Purchase.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedPurchases = purchases.rows.map((purchase) => ({
      id: purchase.id,
      purchaseDate: purchase.purchaseDate,
      totalAmount: purchase.totalAmount,
      user: {
        id: purchase.user.id,
        username: purchase.user.username,
      },
      products: purchase.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.PurchaseProduct.quantity,
      })),
    }));

    res.status(SUCCESS.OK.status).json({
      totalPages: Math.ceil(purchases.count / limit),
      currentPage: page,
      totalPurchases: purchases.count,
      purchases: formattedPurchases,
    });
  } catch (error) {
    logger.error(error);
    next(new InternalServerError());
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getAdminPurchases,
};
