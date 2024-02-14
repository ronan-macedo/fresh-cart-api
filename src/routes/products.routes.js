/**
 * Express Router for product-related routes.
 * @typedef {import('express').Router} ExpressRouter
 */

const { requiresAuth } = require('express-openid-connect');
const productsController = require('../controllers/products.controller');
const commonValidator = require('../validators/common.validator');
const productsValidator = require('../validators/products.validator');
const utils = require('../utils');

/**
 * Express Router for product-related routes.
 * @type {ExpressRouter}
 */
const productsRouter = require('express').Router();

/**
 * Retrieves a paginated list of products.
 * @function
 * @name GET /products
 * @memberof ExpressRouter
 */
productsRouter.get(
    '/',
    requiresAuth(),
    utils.errorHandler(productsController.getPaginatedProducts));

/**
 * Retrieves a single product by id.
 * @function
 * @name GET /products/:id
 * @memberof ExpressRouter
 */
productsRouter.get(
    '/:id',
    requiresAuth(),
    commonValidator.idRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(productsController.getProduct));

/**
 * Creates a new product.
 * @function
 * @name POST /products
 * @memberof ExpressRouter
 */
productsRouter.post(
    '/',
    requiresAuth(),
    productsValidator.createProductRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(productsController.createProduct));

/**
 * Updates an existing product.
 * @function
 * @name PUT /products/:id
 * @memberof ExpressRouter
 */
productsRouter.put(
    '/:id',
    requiresAuth(),
    productsValidator.updateProductRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(productsController.updateProduct));

/**
 * Deletes a product by ID.
 * @function
 * @name DELETE /products/:id
 * @memberof ExpressRouter
 */
productsRouter.delete(
    '/:id',
    requiresAuth(),
    commonValidator.idRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(productsController.deleteProduct));

module.exports = productsRouter;