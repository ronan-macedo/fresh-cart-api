require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const initinitializeDb = require('./database/connection').initializeDb;
const { auth, requiresAuth } = require('express-openid-connect');
const cors = require('cors');
const utils = require('./utils');

// Authentication configuration
const authConfig = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
};

// Swagger configuration
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = process.env.NODE_ENV === 'development' ?
    require('../swagger-local.json') : require('./swagger.json');

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
            .use('/', require('./routes'))
            .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
            .use(async (req, res, next) => {
                next({ status: 404, message: "Sorry, this route don't exists." });
            })
            .use(async (err, req, res, next) => {
                console.error(`Error at: "${req.originalUrl}": ${err.message}`);
                let message = err.status == 404 ? err.message : 'Sorry, an error occurred in your request.';
                res.status(err.status || 500).json({ error: message });
            });

        app.listen(port, () => {
            console.log('Database connected and HTTP server is running.');
        });
    }
});