const express = require('express');
const app = express();

const port = process.env.PORT || 5500;

app.use('/', require('./routes'));

app.listen(port);
    console.log(`Running on ${port}`);