const { body } = require('express-validator');
const membershipsValidator = {};

/**
 * Validation rules for activate or deactivate a membership.
 * @returns {Array} Validations rules.
 */
membershipsValidator.membershipRules = () => {
    return [
        body('customerId')
            .trim()
            .notEmpty()
            .withMessage('customerId is required.')
            .isAlphanumeric()
            .withMessage('customerId does not have any special character.')
            .isLength({ min: 24, max: 24 })
            .withMessage('customerId should have 24 characters.'),

        body('membership')
            .trim()
            .notEmpty()
            .withMessage('membership is required.')
            .isBoolean()
            .withMessage('membership should be true or false.'),
    ];
}

module.exports = membershipsValidator;