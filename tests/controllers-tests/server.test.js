const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const indexRouter = require('../routes/index'); 

// Express - test

const app = express();
app.use(bodyParser.json());
app.use(session({

  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

//Mock the passport GitHub strategy - test

passport.authenticate = jest.fn(() => (req, res, next) => {
    
  //Create mock for user object - test

  req.user = { id: '12345', username: 'testuser' };
  next();
});

// Use the index router

app.use('/', indexRouter);

// Mock GitHub callback route

app.get("/github/callback", (req, res) => {

  req.session.user = req.user;
  res.redirect("/");
});

describe('Express Server Routes', () => {

  describe('Index Route', () => {

    test('GET / - should return 200 and render the index view', async () => {
        
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);

    });
  });

  describe('GitHub Callback Route', () => {
    
    test('GET /github/callback - should redirect to home on successful authentication', async () => {

      const response = await request(app).get('/github/callback');
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/');
      
    });
  });

});