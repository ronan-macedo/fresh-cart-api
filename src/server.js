require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const initinitializeDb = require('./database/connection').initializeDb;
const { auth } = require('express-openid-connect');
const cors = require('cors');

// Authentication configuration.
const authConfig = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
};

// Swagger configuration.
const swaggerUi = require('swagger-ui-express');
const environment = process.env.NODE_ENV;
let swaggerDocument;

switch (environment) {
    case 'development':
        swaggerDocument = require('../swagger.dev.json')
        break;

    case 'staging':
        swaggerDocument = require('../swagger.staging.json')
        break;

    default:
        swaggerDocument = require('../swagger.json')
        break;
}

const app = express();
const port = process.env.PORT || 5500;

initinitializeDb((error) => {
    if (error) {
        console.log(error);
        process.exit(1);
    } else {
        app.use(cors())
            .use(auth(authConfig))
            .use(bodyParser.json())                       
            .use(bodyParser.urlencoded({ extended: true }))
            .use('/', require('./routes'))
            .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))            
            .use(async (_req, _res, next) => {
                next({ status: 404, message: "Sorry, this route don't exists." });
            })            
            .use(async (err, req, res, _next) => {
                console.error(`Error at: "${req.originalUrl}": ${err.message}`);
                let message = err.message ? err.message : 'Sorry, an error occurred in your request.';
                res.status(err.status || 500)
                    .setHeader('Content-Type', 'application/json')
                    .json({ error: message });
            });

        app.listen(port, () => {
            console.log('Database connected and HTTP server is running.');
        });
    }
});