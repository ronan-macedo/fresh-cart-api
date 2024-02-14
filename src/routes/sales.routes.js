/**
 * Express Router for sale-related routes.
 * @typedef {import('express').Router} ExpressRouter
 */

const { requiresAuth } = require('express-openid-connect');
const salesController = require('../controllers/sales.controller');
const commonValidator = require('../validators/common.validator');
const salesValidator = require('../validators/sales.validator');
const utils = require('../utils');

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
    requiresAuth(),
    utils.errorHandler(salesController.getPaginatedSale));

/**
 * Retrieves a single sale by ID.
 * @function
 * @name GET /sales/:id
 * @memberof ExpressRouter
 */
salesRouter.get(
    '/:id',
    requiresAuth(),
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
    requiresAuth(),
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
    requiresAuth(),
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
    requiresAuth(),    
    salesValidator.cancelSaleRules(),    
    commonValidator.checkValidationRules,    
    utils.errorHandler(salesController.cancelSale));

module.exports = salesRouter;