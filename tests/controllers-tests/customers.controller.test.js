const express = require('express');
const supertest = require('supertest');
const router = require('../routes/customers.routes');
const customersController = require('../controllers/customers.controller');

// Mock the coachesController
jest.mock('../controllers/customers.controller');

const app = express();
app.use(express.json());
app.use('/customers.routes', router);

