const Product = require('./model');
const { InternalServerError } = require('../utils/customErrors');
const { SUCCESS } = require('../constants/httpCodes');
const { CREATED, OK } = SUCCESS;
const logger = require('../utils/logger');

const createProduct = async (req, res, next) => {
  try {
    const { lotNumber, name, price, availableQuantity, entryDate } = req.body;
    const product = await Product.create({
      lotNumber,
      name,
      price,
      availableQuantity,
      entryDate,
    });
    res.status(CREATED.status).json(product);
  } catch (error) {
    logger.error(error);
    next(new InternalServerError());
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.status(OK.status).json(products);
  } catch (error) {
    logger.error(error);
    next(new InternalServerError());
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lotNumber, name, price, availableQuantity, entryDate } = req.body;
    const product = await Product.update(
      { lotNumber, name, price, availableQuantity, entryDate },
      { where: { id } },
    );
    res.status(OK.status).json(product);
  } catch (error) {
    logger.error(error);
    next(new InternalServerError());
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
};
