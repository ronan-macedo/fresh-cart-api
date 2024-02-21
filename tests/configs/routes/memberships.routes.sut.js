/**
 * Express Router for membership-related routes.
 * @typedef {import('express').Router} ExpressRouter
 */

const membershipsController = require('../../../src/controllers/memberships.controller');
const commonValidator = require('../../../src/validators/common.validator');
const membershipsValidator = require('../../../src/validators/memberships.validator');
const utils = require('../../../src/utils');

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
    utils.errorHandler(membershipsController.getPaginatedMemberships));

/**
* Retrieves a single membership by code.
* @function
* @name GET /memberships/:code
* @memberof ExpressRouter
*/
membershipsRouter.get(
    '/:code',
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
    membershipsValidator.membershipRules(),
    commonValidator.checkValidationRules,
    utils.errorHandler(membershipsController.activateDeactivateMembership));

module.exports = membershipsRouter;