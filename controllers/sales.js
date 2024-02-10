const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

//Read (GET) all Sales from the database
const getAll = async (req, res) => {
          const result = await mongodb
            .getDatabase()
            .db()
            .collection('books')
            .find();
        result.toArray().then((sales) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(sales);
        });
    };

//Read (GET) a sale Details (based on Id) from the database
const getSingle = async (req, res) => {
        const salesId = new ObjectId();
        const result = await mongodb            
            .getDatabase()
            .db()
            .collection('sales')
            .find({ _id: salesId});
        result.toArray().then((lists) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists[0]);
    });
  };
  
//Create (POST) a new Book Details in the Database
const createSales = async (req, res, next) => {
      //New Sales Details
    const newSales = {
        bookISBN: req.body.bookISBN,
        bookTitle: req.body.bookTitle,
        bookDescription: req.body.bookDescription,
        authorName: req.body.authorName,
        releaseDate: req.body.releaseDate,
        publisher: req.body.publisher,
        price: req.body.price
    };
    //Connect to database
    const response = await mongodb
        .getDatabase()
        .db()
        .collection('sales')
        .insertOne(newSales);
    if(response.acknowledged) {
        res.status(201).json(response);
    } else {
        res.status(500).json(response.error || 'Sorry, New Sales Detail was not created.');
    }
};
//Update (PUT) an Sales Details in the Database
const updateSales = async (req, res) => {
     const salesId = new ObjectId();
    // be aware of updateOne if you only want to update specific fields
     const updateSales = {
      bookISBN: req.body.bookISBN,
           bookTitle: req.body.bookTitle,
           bookDescription: req.body.bookDescription,
           authorName: req.body.authorName,
           releaseDate: req.body.releaseDate,
           publisher: req.body.publisher,
           price: req.body.price
     };
     const response = await mongodb
       .getDatabase()
       .db()
       .collection('books')
       .replaceOne({ _id: salesId }, updateSales);
     console.log(response);
     if (response.modifiedCount > 0) {
       res.status(204).send();
     } else {
       res.status(500).json(response.error || 'Some error occurred while updating the Sales details.');
     }
   };
   


    module.exports = { 
        getAll, 
        getSingle,
        createSales,
        updateSales
                
};