const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

//Read (GET) all Customers Details from the database
const getAll = async (req, res) => {
          const result = await mongodb
            .getDatabase()
            .db()
            .collection('customers')
            .find();
        result.toArray().then((customers) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(customers);
        });
    };

//Read (GET) a Customer Details (based on Id) from the database
const getSingle = async (req, res) => {
        const customerId = new ObjectId();
        const result = await mongodb            
            .getDatabase()
            .db()
            .collection('cutomers')
            .find({ _id: customerId});
        result.toArray().then((lists) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists[0]);
    });
  };
  
//Create (POST) a new Customer Details in the Database
const createCustomer = async (req, res, next) => {
      //New Customer Details
    const newCustomer = {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address
    };
    //Connect to database
    const response = await mongodb
        .getDatabase()
        .db()
        .collection('customer')
        .insertOne(newCustomer);
    if(response.acknowledged) {
        res.status(201).json(response);
    } else {
        res.status(500).json(response.error || 'Sorry, New Book Details was not created.');
    }
};
//Update (PUT) an old Customer Details in the Database
const updateCustomer = async (req, res) => {
      const customerId = new ObjectId();
      const updateCustomer = {
           username: req.body.username,
           firstName: req.body.firstName,
           lastName: req.body.lastName,
           email: req.body.email,
           password: req.body.password,
           phoneNumber: req.body.phoneNumber,
           address: req.body.address
     };
     const response = await mongodb
       .getDatabase()
       .db()
       .collection('books')
       .replaceOne({ _id: customerId }, updateCustomer);
     console.log(response);
     if (response.modifiedCount > 0) {
       res.status(204).send();
     } else {
       res.status(500).json(response.error || 'Some error occurred while updating the Book details.');
     }
   };
   

//Delete (DELETE) a Customer Details from the Database
const deleteCustomer = async (req, res) => {
    const bookId = new ObjectId();
     // be aware of deleteOne, changes can't be undone
    const response = await mongodb
    .getDatabase()
    .db()
    .collection('customers')
    .deleteOne({ _id: customerId }, true);
    console.log(response);
    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(500).json(response.error || 'Some error occurred while deleting the Book Details.');
    }
  };
    module.exports = { 
        getAll, 
        getSingle,
        createCustomer,
        updateCustomer,
        deleteCustomer           
};