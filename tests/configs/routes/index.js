/**
 * Express Router for configuring API routes.
 * @typedef {import('express').Router} ExpressRouter
 */
const router = require('express').Router();

/**
 * Express Router for customer-related routes.
 * @type {ExpressRouter}
 */
router.use('/customer', require('./customers.routes.sut'));

/**
 * Express Router for product-related routes.
 * @type {ExpressRouter}
 */
router.use('/product', require('./products.routes.sut'));

/**
 * Express Router for membership-related routes.
 * @type {ExpressRouter}
 */
router.use('/membership', require('./memberships.routes.sut'));

/**
 * Express Router for sale-related routes.
 * @type {ExpressRouter}
 */
router.use('/sale', require('./sales.routes.sut'));

module.exports = router;