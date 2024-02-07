const express = require('express');
const router = express();


router.use('/sales', require('./sales'));

//Read (Get) All Products Details from the database
router.get('/', salesController.getAll);
// Read (GET) a Product Customer Details from the database
router.get('/:id', salesController.getSingle);
//Create (POST) a new Product Details
router.post('/', salesController.createSale);
//Update (PUT) a Product Details
router.put('/:id', salesController.updateSale);


module.exports = router;