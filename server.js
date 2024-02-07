const express = require('express');
const app = express();
const mongodb = require('./data/database');

const port = process.env.PORT || 5500;

app.use('/', require('./routes'));

mongodb.initDb((err) => {
    if (err) {
      console.log(err);
    } else {
      app.listen(port);
      console.log(`Database Listening and Node Running on port ${port}`);
    }
  });