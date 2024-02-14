const healthcheckRouter = require('express').Router();

/**
 * The health check endpoint is responsible for checking 
 * the application's availability.
 * @param {Object} _req Express request object (unused in this route).
 * @param {Object} res Express response object.
 * @param {Function} _next Express next middleware function (unused in this route).
 * @returns {Response} Express response object with health check information.
 * @throws {Error} If an error occurs during the health check, it updates the healthcheck message 
 * and responds with a 503 status.
 */
healthcheckRouter.get('/', async (_req, res, _next) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'Healthy',
        timestamp: Date.now()
    };
    try {
        res.status(200).send(healthcheck);
    } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
    }
});

module.exports = healthcheckRouter;