/**
 * Express Router for configuring API routes.
 * @typedef {import('express').Router} ExpressRouter
 */
const router = require('express').Router();

/**
 * Configures the Swagger API documentation.
 * @type {ExpressRouter}
 */
router.use('/', require('./swagger.routes'));

/**
 * Enables health checks for the application.
 * @type {ExpressRouter}
 */
router.use('/health', require('./healthcheck.routes'));

/**
 * Redirects to Swagger documentation.
 * @param {Object} _req - Express request object (unused in this route).
 * @param {Object} res - Express response object. 
 * @returns {void}
 */
router.get('/', (_req, res) => {
    res.redirect(process.env.BASE_URL + '/api-docs');
});

/** 
 * Handlers the login return.
 * @param {Object} _req - Express request object (unused in this route).
 * @param {Object} res - Express response object. 
 * @returns {void}
 */
router.get('/callback', (_req, res) => {
    res.redirect(process.env.BASE_URL + '/api-docs');
});

/**
 * Express Router for customer-related routes.
 * @type {ExpressRouter}
 */
router.use('/customer', require('./customers.routes'));

/**
 * Express Router for product-related routes.
 * @type {ExpressRouter}
 */
router.use('/product', require('./products.routes'));

/**
 * Express Router for membership-related routes.
 * @type {ExpressRouter}
 */
router.use('/membership', require('./memberships.routes'));

/**
 * Express Router for sale-related routes.
 * @type {ExpressRouter}
 */
router.use('/sale', require('./sales.routes'));

module.exports = router;