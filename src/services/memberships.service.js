const customersModel = require('../models/customers.model');
const membershipsModel = require('../models/memberships.model');

const membershipsService = {};

/** 
 * @typedef {import('mongodb').ObjectId} ObjectId BSON ObjectId type.
 */

/**
 * Creates a new membership. 
 * @returns {Promise<string|null>} Returns the newly created membership code or null if the creation process fails. 
 */
membershipsService.createMembership = async () => {
    return processCreateMembership();
}

/**
 * Deletes a membership by its code.
 * @param {string} membershipCode The membership code to delete.
 * @returns {Promise<Boolean>} Returns true if the deletion is successful, false otherwise. 
 */
membershipsService.deleteMembership = async (membershipCode) => {
    const result = await membershipsModel.deleteMembership(membershipCode);

    if (result.deletedCount > 0) {
        return true;
    }

    return false;
}

/**
 * Activates or deactivates a customer's membership
 * @param {ObjectId} customerId The customer id.
 * @param {Boolean} isActive the activation flag.
 * @returns {Promise<Boolean>} Returns true if activation/deactivation is successful, false otherwise.
 */
membershipsService.activateDeactivateMembership = async (customerId, isActive) => {
    const membershipCode = await customersModel.getMembershipCode(customerId);

    if (membershipCode) {
        const membershipUpdate = { active: isActive };
        const result = await membershipsModel.updateMembership(membershipCode, membershipUpdate);

        return result.matchedCount > 0
    }

    if (isActive) {
        const membershipCode = await processCreateMembership();

        if (membershipCode) {
            const customerUpdate = { membershipCode };
            const result = await customersModel.updateCustomer(customerId, customerUpdate);

            return result.matchedCount > 0
        }

        return false;
    }

    return false;
}

/**
 * Updates the activation status of a membership.
 * @param {string} membershipCode The membership code to update.
 * @param {Boolean} isActive The new activation status for the membership.
 * @returns {Promise<Boolean>} Returns true if the update is successful, false otherwise.
 */
membershipsService.updateMembership = async (membershipCode, isActive) => {
    const membershipUpdate = { active: isActive };
    const result = await membershipsModel.updateMembership(membershipCode, membershipUpdate);

    return result.matchedCount > 0
}

/**
 * Generates a random membership code. 
 * @returns {string} - Returns a randomly generated membership code.
 */
const generateMembershipCode = () => {
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let membershipCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        membershipCode += characters.charAt(randomIndex);
    }

    return membershipCode;
}

/**
 * Processes the creation of a new membership. 
 * @returns {Promise<string|null>} - Returns the newly created membership code or null if the creation process fails. 
 */
const processCreateMembership = async () => {
    const membershipCode = generateMembershipCode();
    const currentDate = new Date();
    const registrationDate = currentDate.toISOString().split('T')[0];

    const membership = {
        code: membershipCode,
        registrationDate: registrationDate,
        points: 0,
        active: true
    };

    const result = await membershipsModel.createMembership(membership);

    if (result.acknowledged) {
        return membershipCode;
    }

    return null;
}

module.exports = membershipsService;