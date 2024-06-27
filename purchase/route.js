const express = require('express');
const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getAdminPurchases,
} = require('./controller');
const { authenticate, authorize } = require('../middleware/authValidator');
const validate = require('../middleware/schemaValidator');
const { createPurchaseSchema } = require('./schema');
const router = express.Router();

/**
 * @api {get} /purchases/admin Obtener todas las compras (Administrador)
 * @apiName ObtenerTodasLasComprasAdmin
 * @apiGroup Compras
 * @apiPermission admin
 *
 * @apiSuccess {Object[]} compras Lista de todas las compras para administradores.
 */
router.get('/admin', authenticate, authorize('admin'), getAdminPurchases);

/**
 * @api {get} /purchases/:id Obtener compra por ID
 * @apiName ObtenerCompraPorID
 * @apiGroup Compras
 * @apiPermission client
 *
 * @apiParam {Number} id ID de la compra a obtener.
 *
 * @apiSuccess {Object} compra Detalles de la compra.
 */
router.get('/:id', authenticate, authorize('client'), getPurchaseById);

/**
 * @api {post} /purchases/ Crear compra
 * @apiName CrearCompra
 * @apiGroup Compras
 * @apiPermission client
 *
 * @apiParam {Object} datos Datos de la compra a crear.
 *
 * @apiSuccess {Number} id ID de la compra creada.
 * @apiSuccess {String} mensaje Mensaje de éxito.
 */
router.post(
  '/',
  validate(createPurchaseSchema),
  authenticate,
  authorize('client'),
  createPurchase,
);

/**
 * @api {get} /purchases/ Obtener todas las compras
 * @apiName ObtenerCompras
 * @apiGroup Compras
 * @apiPermission client
 *
 * @apiSuccess {Object[]} compras Lista de todas las compras.
 */
router.get('/', authenticate, authorize('client'), getPurchases);

module.exports = router;
