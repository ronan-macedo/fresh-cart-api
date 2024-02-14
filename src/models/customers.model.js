const connection = require('../database/connection').getConnection;

const customersModel = {};
const customersCollection = connection().collection('customers');

/** 
 * @typedef {import('mongodb').ObjectId} ObjectId BSON ObjectId type.
 */

/**
 * Get customers with pagination.
 * @param {Number} skipedItems Number of skiped items.
 * @param {Number} pageSize Page size value.
 * @returns {Promise<Array>} A list of customer objects or empty list.
 */
customersModel.getPaginatedCustomers = async (skipedItems, pageSize) => {
    return await customersCollection.find()
        .skip(skipedItems)
        .limit(pageSize)
        .toArray();
}

/**
 * Get a customer by id.
 * @param {ObjectId} id Id of the customer.
 * @returns {Promise<Object|null>} A customer object.
 */
customersModel.getCustomer = async (id) => {
    return await customersCollection.findOne({ _id: id });
}

/**
 * Get a customer by membership code.
 * @param {string} code Membership code of the customer.
 * @returns {Promise<Object|null>} A customer object or null.
 */
customersModel.getCustomerByMembershipCode = async (code) => {
    return await customersCollection.findOne({ membershipCode: code });
}

/**
 * Get a membership code by customer id.
 * @param {ObjectId} id Id of the customer.
 * @returns {Promise<string> | null} A membership code.
 */
customersModel.getMembershipCode = async (id) => {
    const customer = await customersCollection.findOne({ _id: id });
    return customer.membershipCode ? customer.membershipCode : null;
}

/**
 * Insert a new customer object.
 * @param {object} customer Customer object.
 * @returns {Promise<Object>} An insert object result.
 */
customersModel.createCustomer = async (customer) => {
    return await customersCollection.insertOne(customer);
}

/**
 * Update a customer object.
 * @param {ObjectId} id Id of the customer.
 * @param {object} customer Customer object.
 * @returns {Promise<Object>} An update object result.
 */
customersModel.updateCustomer = async (id, customer) => {
    return await customersCollection.updateOne({ _id: id }, { $set: customer });
}

/**
 * Delete a customer object.
 * @param {ObjectId} id Id of the customer.
 * @returns {Promise<Object>} An delete object result.
 */
customersModel.deleteCustomer = async (id) => {
    return await customersCollection.deleteOne({ _id: id }, true);
}

/**
 * Count the number of customers available.
 * @returns {Promise<Number>} Number of customers.
 */
customersModel.countCustomers = async () => {
    return await customersCollection.countDocuments();
}

module.exports = customersModel;