const express = require('express');
const router = express();


//Read (Get) All identities from the database
router.get('/', identitiesController.getAll);
// Read (GET) a single identity from the database
router.get('/', customersController.getSingle);


module.exports = router;