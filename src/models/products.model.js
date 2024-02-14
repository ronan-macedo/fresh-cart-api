const connection = require('../database/connection').getConnection;

const productsModel = {};
const productsCollection = connection().collection('products');

/**
 * BSON ObjectId type.
 * @typedef {import('mongodb').ObjectId} ObjectId
 */

/**
 * Get products with pagination.
 * @param {Number} skipedItems Number of skiped items.
 * @param {Number} pageSize Page size value.
 * @returns {Promise<Array>} A list of product objects or empty list.
 */
productsModel.getPaginatedProducts = async (skipedItems, pageSize) => {
    return await productsCollection.find()
        .skip(skipedItems)
        .limit(pageSize)
        .toArray();
}

/**
 * Get a product by id.
 * @param {ObjectId} id Id of the product.
 * @returns {Promise<Object|null>} A product object.
 */
productsModel.getProduct = async (id) => {
    return await productsCollection.findOne({ _id: id });
}

/**
 * Insert a new product object.
 * @param {object} product Product object.
 * @returns {Promise<Object>} An insert object result.
 */
productsModel.createProduct = async (product) => {
    return await productsCollection.insertOne(product);
}

/**
 * Update a product object.
 * @param {ObjectId} id Id of the product.
 * @param {object} product Product object.
 * @returns {Promise<Object>} An update object result.
 */
productsModel.updateProduct = async (id, product) => {
    return await productsCollection.updateOne({ _id: id }, { $set: product });
}

/**
 * Delete a product object.
 * @param {ObjectId} id Id of the product.
 * @returns {Promise<Object>} An delete object result.
 */
productsModel.deleteProduct = async (id) => {
    return await productsCollection.deleteOne({ _id: id }, true);
}

/**
 * Count the number of products available.
 * @returns {Promise<Number>} Number of products.
 */
productsModel.countProducts = async() => {
    return await productsCollection.countDocuments();
}

module.exports = productsModel;