const express = require('express');
const router = express();


router.use('/products', require('./products'));

//Read (Get) All Products Details from the database
router.get('/', productsController.getAll);
// Read (GET) a Product Customer Details from the database
router.get('/:id', productsController.getSingle);
//Create (POST) a new Product Details
router.post('/', productsController.createCustomer);
//Update (PUT) a Product Details
router.put('/:id', productsController.updateCustomer);
//Delete (DELETE) a Product 
router.delete('/:id', productsController.deleteCustomer);

module.exports = router;