const { param, validationResult } = require('express-validator');
const utils = require('../utils');
const commonValidator = {};

/**
 * Validation rules for entities id.
 * @returns {Array} Validations rules.
 */
commonValidator.idRules = () => {
    return [
        param('id')
            .trim()
            .notEmpty()
            .withMessage('Id is required.')
            .isAlphanumeric()
            .withMessage('Id does not have any special character.')
            .isLength({ min: 24, max: 24 })
            .withMessage('Id should have 24 characters.'),
    ];
}

/**
 * Validation rules for membershipCode.
 * @returns {Array} Validations rules.
 */
commonValidator.codeRules = () => {
    return [
        param('code')
            .trim()
            .notEmpty()
            .withMessage('code is required.')
            .isLength({ min: 8, max: 8 })
            .withMessage('customerId should have 8 characters.'),
    ];
}

/**
 * Check validation rules before move to the controller.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next middleware function.
 * @returns {Promise<void>} Moves to the next function if validation passes; 
 * otherwise, sends a 400 response with validation errors.
 */
commonValidator.checkValidationRules = async (req, res, next) => {
    let validationErrors = [];
    validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        await utils.badRequestErrorListResponse(res, validationErrors.array())
        return;
    }

    next();
}

module.exports = commonValidator;