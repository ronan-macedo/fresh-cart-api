const membershipsModel = require('../models/memberships.model');
const customersModel = require('../models/customers.model');
const membershipsService = require('../services/memberships.service');
const utils = require('../utils');
const { ObjectId } = require('mongodb');

const membershipsController = {};

/**
 * Retrieves a paginated list of memberships.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
membershipsController.getPaginatedMemberships = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const totalMemberships = await membershipsModel.countMemberships();
        const totalPages = Math.ceil(totalMemberships / pageSize);
        const skipedItems = (page - 1) * pageSize;
        const memberships = await membershipsModel.getPaginatedMemberships(skipedItems, pageSize);

        await utils.okPaginatedResponse(res, totalPages, page, memberships);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Retrieves a membership by membership code.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
membershipsController.getMembershipByMembershipCode = async (req, res) => {
    const code = req.params.code;

    try {
        const membership = await membershipsModel.getMembership(code);

        if (!membership) {
            await utils.notFoundResponse(res, "membership");
            return;
        }

        await utils.okResponse(res, membership);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Activates or deactivates a membership.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
membershipsController.activateDeactivateMembership = async (req, res) => {
    const customerId = new ObjectId(String(req.body.customerId));
    const isActive = req.body.membership === 'true';

    try {
        const result = await membershipsService.activateDeactivateMembership(customerId, isActive);

        if (result) {
            const membershipCode = await customersModel.getMembershipCode(customerId);
            const membership = await membershipsModel.getMembership(membershipCode);
            await utils.okResponse(res, membership);
            
            return;
        }

        await utils.badRequestResponse(res, "Error while handling membership.");
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

module.exports = membershipsController;