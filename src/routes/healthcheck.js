const healthcheckRouter = require('express').Router();

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