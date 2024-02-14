const connection = require('../database/connection').getConnection;

const membershipsModel = {};
const membershipsCollection = connection().collection('memberships');

/**
 * Get memberships with pagination.
 * @param {Number} skipedItems Number of skiped items.
 * @param {Number} pageSize Page size value.
 * @returns {Promise<Array>} A list of membership objects or empty list.
 */
membershipsModel.getPaginatedMemberships = async (skipedItems, pageSize) => {
    return await membershipsCollection.find()
        .skip(skipedItems)
        .limit(pageSize)
        .toArray();
}

/**
 * Get a membership by membership code.
 * @param {string} code Membership code.
 * @returns {Promise<Object|null>} A membership object.
 */
membershipsModel.getMembership = async (code) => {
    return await membershipsCollection.findOne({ code: code });
}

/**
 * Get points by membership code.
 * @param {string} code Membership code.
 * @returns {Promise<Number>} A number of points.
 */
membershipsModel.getPoints = async (code) => {
    const membership = await membershipsCollection.findOne({ code: code });
    return membership.points;
}

/**
 * Insert a new membership object.
 * @param {Object} membership Membership object.
 * @returns {Promise<Object>} An insert object result.
 */
membershipsModel.createMembership = async (membership) => {
    return await membershipsCollection.insertOne(membership);
}

/**
 * Update a membership object.
 * @param {string} code Membership code.
 * @param {Object} membership Membership object.
 * @returns {Promise<Object>} An update object result.
 */
membershipsModel.updateMembership = async (code, membership) => {
    return await membershipsCollection.updateOne({ code: code }, { $set: membership });
}

/**
 * Delete a membership object.
 * @param {string} code Membership code.
 * @returns {Promise<Object>} An delete object result.
 */
membershipsModel.deleteMembership = async (code) => {
    return await membershipsCollection.deleteOne({ code: code }, true);
}

/**
 * Count the number of memberships available.
 * @returns {Promise<Number>} Number of memberships.
 */
membershipsModel.countMemberships = async() => {
    return await membershipsCollection.countDocuments();
}

module.exports = membershipsModel;