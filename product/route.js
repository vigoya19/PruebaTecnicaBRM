const express = require('express');
const { createProductSchema, updateProductSchema } = require('./schema');
const validate = require('../middleware/schemaValidator');

const { createProduct, getProducts, updateProduct } = require('./controller');
const { authenticate, authorize } = require('../middleware/authValidator');
const router = express.Router();

/**
 * @api {post} /products/ Create a new product
 * @apiName CreateProduct
 * @apiGroup Products
 * @apiPermission admin
 *
 * @apiParam {String} lotNumber Lot number of the product.
 * @apiParam {String} name Name of the product.
 * @apiParam {Number} price Price of the product.
 * @apiParam {Number} availableQuantity Available quantity of the product.
 * @apiParam {String} entryDate Entry date of the product.
 *
 * @apiSuccess {Object} product The created product.
 * @apiSuccess {Number} product.id ID of the product.
 * @apiSuccess {String} product.lotNumber Lot number of the product.
 * @apiSuccess {String} product.name Name of the product.
 * @apiSuccess {Number} product.price Price of the product.
 * @apiSuccess {Number} product.availableQuantity Available quantity of the product.
 * @apiSuccess {String} product.entryDate Entry date of the product.
 */
router.post(
  '/',
  validate(createProductSchema),
  authenticate,
  authorize('admin'),
  createProduct,
);

/**
 * @api {get} /products/ Get all products
 * @apiName GetProducts
 * @apiGroup Products
 *
 * @apiSuccess {Object[]} products List of products.
 */
router.get('/', getProducts);

/**
 * @api {put} /products/:id Update a product
 * @apiName UpdateProduct
 * @apiGroup Products
 * @apiPermission admin
 *
 * @apiParam {Number} id Product ID.
 * @apiParam {String} [lotNumber] Lot number of the product.
 * @apiParam {String} [name] Name of the product.
 * @apiParam {Number} [price] Price of the product.
 * @apiParam {Number} [availableQuantity] Available quantity of the product.
 * @apiParam {String} [entryDate] Entry date of the product.
 *
 * @apiSuccess {Object} product The updated product.
 */
router.put(
  '/:id',
  validate(updateProductSchema),
  authenticate,
  authorize('admin'),
  updateProduct,
);

module.exports = router;
