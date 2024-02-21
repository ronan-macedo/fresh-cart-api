const express = require('express');
const app = express();

app.use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use('/', require('./routes'))
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

module.exports = app;