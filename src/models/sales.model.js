const connection = require('../database/connection').getConnection;

const salesModel = {};
const salesCollection = connection().collection('sales');

/**
 * BSON ObjectId type.
 * @typedef {import('mongodb').ObjectId} ObjectId
 */

/**
 * Get sales with pagination.
 * @param {Number} skipedItems Number of skiped items.
 * @param {Number} pageSize Page size value.
 * @returns {Promise<Array>} A list of sale objects or empty list.
 */
salesModel.getPaginatedSales = async (skipedItems, pageSize) => {
    return await salesCollection.find()
        .skip(skipedItems)
        .limit(pageSize)
        .toArray();
}

/**
 * Get a sale by id.
 * @param {ObjectId} id Id of the sale.
 * @returns {Promise<Object|null>} A product object.
 */
salesModel.getSale = async (id) => {
    return await salesCollection.findOne({ _id: id });
}

/**
 * Insert a new sale object.
 * @param {object} sale Sale object.
 * @returns {Promise<Object>} An insert object result.
 */
salesModel.createSale = async (sale) => {
    return await salesCollection.insertOne(sale);
}

/**
 * Update a sale object.
 * @param {ObjectId} id Id of sale.
 * @param {object} sale Sale object.
 * @returns {Promise<Object>} An update object result.
 */
salesModel.updateSale = async (id, sale) => {
    return await salesCollection.updateOne({ _id: id }, { $set: sale });
}

/**
 * Count the number of sales available.
 * @returns {Promise<Number>} Number of sales.
 */
salesModel.countSales = async() => {
    return await salesCollection.countDocuments();
}

module.exports = salesModel;