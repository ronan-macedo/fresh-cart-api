const swaggerRouter = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const environment = process.env.NODE_ENV;
let swaggerDocument;

switch (environment) {
    case 'development':
        swaggerDocument = require('../../swagger.dev.json')
        break;

    case 'staging':
        swaggerDocument = require('../../swagger.staging.json')
        break;

    default:
        swaggerDocument = require('../../swagger.json')
        break;
}

/**
 * Setup the swagger ui with the correct api documentation.
 */
swaggerRouter.use('/api-docs', swaggerUi.serve);
swaggerRouter.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = swaggerRouter;