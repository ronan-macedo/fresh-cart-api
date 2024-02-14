/**
 * Express Router for membership-related routes.
 * @typedef {import('express').Router} ExpressRouter
 */

const { requiresAuth } = require('express-openid-connect');
const membershipsController = require('../controllers/memberships.controller');
const commonValidator = require('../validators/common.validation');
const membershipsValidator = require('../validators/memberships.validator');
const utils = require('../utils');

/**
 * Express Router for membership-related routes.
 * @type {ExpressRouter}
 */
const membershipsRouter = require('express').Router();

/**
 * Retrieves a paginated list of memberships.
 * @function
 * @name GET /memberships
 * @memberof ExpressRouter
 */
membershipsRouter.get(
    '/',
    requiresAuth(),
    utils.errorHandler(membershipsController.getPaginatedMemberships));

/**
* Retrieves a single membership by code.
* @function
* @name GET /memberships/:code
* @memberof ExpressRouter
*/
membershipsRouter.get(
    '/:code',
    requiresAuth(),
    commonValidator.codeRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(membershipsController.getMembershipByMembershipCode));

/**
 * Activates or deactivates a membership.
 * @function
 * @name POST /memberships
 * @memberof ExpressRouter
 */
membershipsRouter.post(
    '/',
    requiresAuth(),
    membershipsValidator.membershipRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(membershipsController.activateDeactivateMembership));

module.exports = membershipsRouter;