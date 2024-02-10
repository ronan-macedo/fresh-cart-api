const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

//Read (GET) all Products Details from the database
const getAll = async (req, res) => {
         const result = await mongodb
            .getDatabase()
            .db()
            .collection('products')
            .find();
        result.toArray().then((products) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(products);
        });
    };

//Read (GET) a product Details (based on Id) from the database
const getSingle = async (req, res) => {
        const productId = new ObjectId();
        const result = await mongodb            
            .getDatabase()
            .db()
            .collection('products')
            .find({ _id: productId});
        result.toArray().then((lists) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists[0]);
    });
  };
  
//Create (POST) a new product Details in the Database
const createProduct = async (req, res, next) => {
      //New Product Details
    const newProduct = {
        name: req.body.name,
        category: req.body.category,
        photoUrls: req.body.photoUrls,
        tags: req.body.tags,
        status: req.body.status
    };
    //Connect to database
    const response = await mongodb
        .getDatabase()
        .db()
        .collection('books')
        .insertOne(newProduct);
    if(response.acknowledged) {
        res.status(201).json(response);
    } else {
        res.status(500).json(response.error || 'Sorry, New Book Details was not created.');
    }
};
//Update (PUT) an old Product Details in the Database
const updateProduct = async (req, res) => {
    const productId = new ObjectId(req.params.id);
    // be aware of updateOne if you only want to update specific fields
     const updateProduct = {
        name: req.body.name,
        category: req.body.category,
        photoUrls: req.body.photoUrls,
        tags: req.body.tags,
        status: req.body.status
     };
     const response = await mongodb
       .getDatabase()
       .db()
       .collection('products')
       .replaceOne({ _id: productId }, updateProduct);
     console.log(response);
     if (response.modifiedCount > 0) {
       res.status(204).send();
     } else {
       res.status(500).json(response.error || 'Some error occurred while updating the Product details.');
     }
   };
   

//Delete (DELETE) a Product Details from the Database
const deleteProduct = async (req, res) => {
    const productId = new ObjectId();
     // be aware of deleteOne, changes can't be undone
    const response = await mongodb
    .getDatabase()
    .db()
    .collection('books')
    .deleteOne({ _id: productId }, true);
    console.log(response);
    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(500).json(response.error || 'Some error occurred while deleting the Product Details.');
    }
  };
    module.exports = { 
        getAll, 
        getSingle,
        createProduct,
        updateProduct,
        deleteProduct           
};