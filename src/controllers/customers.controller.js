const customersModel = require('../models/customers.model');
const membershipsService = require('../services/memberships.service');
const utils = require('../utils')
const { ObjectId } = require('mongodb');

const customersController = {};

/**
 * Retrieves a paginated list of customers.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
customersController.getPaginatedCustomers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const totalCustomers = await customersModel.countCustomers();
        const totalPages = Math.ceil(totalCustomers / pageSize);
        const skipedItems = (page - 1) * pageSize;
        const customers = await customersModel.getPaginatedCustomers(skipedItems, pageSize);

        await utils.okPaginatedResponse(res, totalPages, page, customers);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Retrieves a customer by id.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
customersController.getCustomer = async (req, res) => {
    const id = new ObjectId(String(req.params.id));

    try {
        const customer = await customersModel.getCustomer(id);

        if (!customer) {
            await utils.notFoundResponse(res, 'customer');
            return;
        }

        await utils.okResponse(res, customer);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Retrieves a customer by membership code.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
customersController.getCustomerByMembershipCode = async (req, res) => {
    const code = req.params.code;

    try {
        const customer = await customersModel.getCustomerByMembershipCode(code);

        if (!customer) {
            await utils.notFoundResponse(res, 'customer');
            return;
        }

        await utils.okResponse(res, customer);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Creates a new customer.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
customersController.createCustomer = async (req, res) => {
    const customer = {};
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.email = req.body.email;
    customer.address = {};
    customer.address.firstLine = req.body.address.firstLine;
    if (req.body.address.lastLine) {
        customer.address.lastLine = req.body.address.lastLine;
    }
    customer.address.city = req.body.address.city;
    const membership = req.body.membership === 'true';

    try {
        if (membership) {
            const membershipCode = await membershipsService.createMembership();

            if (!membershipCode) {
                await utils.badRequestResponse(res, 'Error while generating a membership code.');
                return;
            }

            customer.membershipCode = membershipCode;
        }

        const result = await customersModel.createCustomer(customer);

        if (result.acknowledged) {
            const createdCustomer = await customersModel.getCustomer(result.insertedId)
            await utils.createdObjecResultResponse(res, createdCustomer);
            return;
        }

        await utils.badRequestResponse(res, 'Error while creating a customer.');

    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Updates a new customer.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
customersController.updateCustomer = async (req, res) => {
    const id = new ObjectId(String(req.params.id));
    const customerUpdates = {};
    const customerFields = ['firstName', 'lastName', 'email', 'address', 'membership'];
    customerFields.forEach(field => {
        if (field === 'address' && req.body[field]) {
            customerUpdates[field] = {};
            const addressFields = ['firstLine', 'lastLine', 'city'];
            addressFields.forEach(addressField => {
                if (req.body[field][addressField]) {
                    customerUpdates[field][addressField] = req.body[field][addressField];
                }
            });
        } else if (req.body[field]) {
            if (field === 'membership') {
                customerUpdates[field] = req.body[field] === 'true';
            } else {
                customerUpdates[field] = req.body[field];
            }
        }
    });
    const isActive = customerUpdates.membership ? customerUpdates.membership === 'true' : null;

    if (customerUpdates.membership) {
        delete customerUpdates.membership;
    }

    try {
        const membershipCode = await customersModel.getMembershipCode(id);
        let membershipUpdateResult = null;

        if (membershipCode && isActive != null) {
            membershipUpdateResult = await membershipsService.updateMembership(membershipCode, isActive);

            if (membershipUpdateResult === null) {
                await utils.badRequestResponse(res, 'Error while updating membership.');
                return;
            }
        }

        if (!membershipCode && isActive) {
            const newMembershipCode = await membershipsService.createMembership();

            if (!newMembershipCode) {
                await utils.badRequestResponse(res, 'Error while generating a membership code.');
                return;
            }

            customerUpdates.membershipCode = newMembershipCode;
        }

        const existingCustomer = await customersModel.getCustomer(id);
        const customer = updateNestedFields(existingCustomer, customerUpdates);

        const result = await customersModel.updateCustomer(id, customer);

        if (result.matchedCount > 0) {
            const updatedCustomer = await customersModel.getCustomer(id);
            await utils.okResponse(res, updatedCustomer);
            return;
        }

        await utils.badRequestResponse(res, 'Error while updating a customer.');
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Deletes a customer by id.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
customersController.deleteCustomer = async (req, res) => {
    const id = new ObjectId(String(req.params.id));

    try {
        const membershipCode = await customersModel.getMembershipCode(id);

        if (membershipCode) {
            const isDeleted = await membershipsService.deleteMembership(membershipCode);

            if (!isDeleted) {
                await utils.badRequestResponse(res, 'Error while deleteing a membership.');
                return;
            }
        }

        const result = await customersModel.deleteCustomer(id);

        if (result.deletedCount > 0) {
            await utils.noContentResponse(res);
            return;
        }

        await utils.badRequestResponse(res, 'Error while deleting a customer.');
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Recursively updates nested fields in an object, preserving existing values. 
 * @param {Object} existingObject The object to be updated.
 * @param {Object} newObject The object containing updates.
 * @returns {Object} The updated object with preserved existing values. 
 */
const updateNestedFields = (existingObject, newObject) => {
    for (const [key, value] of Object.entries(newObject)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            existingObject[key] = updateNestedFields(existingObject[key] || {}, value);
        } else {
            existingObject[key] = value;
        }
    }
    return existingObject;
};

module.exports = customersController;