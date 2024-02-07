const express = require('express');
const router = express();

const customersController = require('../controllers/customers');

//Read (Get) All Customers Details from the database
router.get('/', customersController.getAll);
// Read (GET) a single Customer Details from the database
router.get('/:id', customersController.getSingle);
//Create (POST) a new Customer Details
router.post('/', customersController.createCustomer);
//Update (PUT) a Customer Details
router.put('/:id', customersController.updateCustomer);
//Delete (DELETE) a Customer Details
router.delete('/:id', customersController.deleteCustomer);