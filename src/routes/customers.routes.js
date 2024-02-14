const { requiresAuth } = require('express-openid-connect');
const customersController = require('../controllers/customers.controller');
const commonValidator = require('../validators/common.validation');
const customersValidator = require('../validators/customers.validator');
const utils = require('../utils')

/**
 * Express Router for customer-related routes.
 * @type {ExpressRouter}
 */
const customersRouter = require('express').Router();

/**
 * Retrieves a paginated list of customers.
 * @function
 * @name GET /customers
 * @memberof ExpressRouter
 */
customersRouter.get(
    '/',
    requiresAuth(),
    utils.errorHandler(customersController.getPaginatedCustomers));

/**
* Retrieves a single customer by id.
* @function
* @name GET /customers/:id
* @memberof ExpressRouter
*/
customersRouter.get(
    '/:id',
    requiresAuth(),
    commonValidator.idRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(customersController.getCustomer));

/**
 * Retrieves a customer by membership code.
 * @function
 * @name GET /customers/membership/:code
 * @memberof ExpressRouter
 */
customersRouter.get(
    '/membership/:code',
    requiresAuth(),
    commonValidator.codeRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(customersController.getCustomerByMembershipCode));

/**
 * Creates a new customer.
 * @function
 * @name POST /customers
 * @memberof ExpressRouter
 */
customersRouter.post(
    '/',
    requiresAuth(),
    customersValidator.createCustomerRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(customersController.createCustomer));

/**
 * Updates an existing customer.
 * @function
 * @name PUT /customers/:id
 * @memberof ExpressRouter
 */
customersRouter.put(
    '/:id',
    requiresAuth(),
    customersValidator.updateCustomerRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(customersController.updateCustomer));


/**
 * Deletes a customer by ID.
 * @function
 * @name DELETE /customers/:id
 * @memberof ExpressRouter
 */
customersRouter.delete(
    '/:id',
    requiresAuth(),
    commonValidator.idRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(customersController.deleteCustomer));

module.exports = customersRouter;