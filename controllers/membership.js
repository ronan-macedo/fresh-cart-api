const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

//Read (GET) all Membership Details from the database
const getAll = async (req, res) => {
   const result = await mongodb
            .getDatabase()
            .db()
            .collection('membership')
            .find();
        result.toArray().then((membership) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(membership);
        });
    };

//Read (GET) Single Membership Details (based on Id) from the database
const getSingle = async (req, res) => {
        const membershipId = new ObjectId()(req.params.id);
        const result = await mongodb            
            .getDatabase()
            .db()
            .collection('membership')
            .find({ _id: membershipId});
        result.toArray().then((lists) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists[0]);
    });
  };
  
//Create (POST) a new Membership Record in the Database
const createMembership = async (req, res, next) => {
      //New Membership Details
    const newMembership = {
        username: req.body.useername,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        userStatus: req.body.userStatus
    };
    //Connect to database
    const response = await mongodb
        .getDatabase()
        .db()
        .collection('membership')
        .insertOne(newMembership);
    if(response.acknowledged) {
        res.status(201).json(response);
    } else {
        res.status(500).json(response.error || 'Sorry, New Book Details was not created.');
    }
};


//Delete (DELETE) a Membership Record from the Database
const deleteMembership = async (req, res) => {
    const bookId = new ObjectId()(req.params.id);
    const response = await mongodb
    .getDatabase()
    .db()
    .collection('books')
    .deleteOne({ _id: membershipId }, true);
    console.log(response);
    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(500).json(response.error || 'Some error occurred while deleting the Membership Record Details.');
    }
  };
    module.exports = { 
        getAll, 
        getSingle,
        createMembership,
        deleteMembership           
};