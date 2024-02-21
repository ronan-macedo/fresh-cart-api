/**
 * Express Router for sale-related routes.
 * @typedef {import('express').Router} ExpressRouter
 */

const salesController = require('../../../src/controllers/sales.controller');
const commonValidator = require('../../../src/validators/common.validator');
const salesValidator = require('../../../src/validators/sales.validator');
const utils = require('../../../src/utils');

/**
 * Express Router for sale-related routes.
 * @type {ExpressRouter}
 */
const salesRouter = require('express').Router();

/**
 * Retrieves a paginated list of sales.
 * @function
 * @name GET /sales
 * @memberof ExpressRouter
 */
salesRouter.get(
    '/',
    utils.errorHandler(salesController.getPaginatedSales));

/**
 * Retrieves a single sale by ID.
 * @function
 * @name GET /sales/:id
 * @memberof ExpressRouter
 */
salesRouter.get(
    '/:id',
    commonValidator.idRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(salesController.getSale));

/**
 * Creates a new sale.
 * @function
 * @name POST /sales
 * @memberof ExpressRouter
 */
salesRouter.post(
    '/',
    salesValidator.createSalesRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(salesController.createSale));

/**
 * Creates a new sale with points.
 * @function
 * @name POST /sales/points
 * @memberof ExpressRouter
 */
salesRouter.post(
    '/points',
    salesValidator.createSalesWithPointsRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(salesController.createSaleWithPoints));

/**
 * Cancels a sale by ID.
 * @function
 * @name PUT /sales/:id
 * @memberof ExpressRouter
 */
salesRouter.put(
    '/:id',
    salesValidator.cancelSaleRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(salesController.cancelSale));

module.exports = salesRouter;