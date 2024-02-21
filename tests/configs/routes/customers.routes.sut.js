/**
 * Express Router for customer-related routes.
 * @typedef {import('express').Router} ExpressRouter
 */

const customersController = require('../../../src/controllers/customers.controller');
const commonValidator = require('../../../src/validators/common.validator');
const customersValidator = require('../../../src/validators/customers.validator');
const utils = require('../../../src/utils')

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
    utils.errorHandler(customersController.getPaginatedCustomers));

/**
* Retrieves a single customer by id.
* @function
* @name GET /customers/:id
* @memberof ExpressRouter
*/
customersRouter.get(
    '/:id',
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
    commonValidator.idRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(customersController.deleteCustomer));

module.exports = customersRouter;