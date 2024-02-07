const express = require('express');
const router = express();

const membershipController = require('../controllers/membership');


//Read (Get) All Membership Details from the database
router.get('/', membershipController.getAll);
// Read (GET) a single Membership Details from the database
router.get('/:id', membershipController.getSingle);
//Create (POST) a new Membership Details
router.post('/', booksController.createMembership);
//Delete (DELETE) a Merbership Details and Code
router.delete('/:id', membershipController.deleteMembership);

module.exports = router;