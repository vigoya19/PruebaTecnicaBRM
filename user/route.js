const express = require('express');
const { register, login } = require('./controller');
const validate = require('../middleware/schemaValidator');
const { userSchema, loginSchema } = require('./schema');
const router = express.Router();

/**
 * @api {post} /auth/register Register a new user
 * @apiName Register
 * @apiGroup Auth
 *
 * @apiParam {String} username Username of the user.
 * @apiParam {String} password Password of the user.
 * @apiParam {String} role Role of the user.
 *
 * @apiSuccess {Object} user The registered user.
 * @apiSuccess {Number} user.id User ID.
 * @apiSuccess {String} user.username Username of the user.
 * @apiSuccess {String} user.role Role of the user.
 */
router.post('/register', validate(userSchema), register);

/**
 * @api {post} /auth/login Login a user
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiParam {String} username Username of the user.
 * @apiParam {String} password Password of the user.
 *
 * @apiSuccess {String} token JWT token.
 */
router.post('/login', validate(loginSchema), login);

module.exports = router;
