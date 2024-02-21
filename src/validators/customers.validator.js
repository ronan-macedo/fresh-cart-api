const { body, param } = require('express-validator');
const customersValidator = {};

/**
 * Validation rules for register a new customer.
 * @returns {Array} Validations rules.
 */
customersValidator.createCustomerRules = () => {
    return [
        body('firstName')
            .trim()
            .notEmpty()
            .withMessage('firstName is required')
            .isLength({ min: 2, max: 30 })
            .withMessage('firstName should have between 2 and 30 characters.'),

        body('lastName')
            .trim()
            .notEmpty()
            .withMessage('lastName is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('lastName should between 2 and 50 characters.'),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('email is required')
            .normalizeEmail()
            .isEmail()
            .withMessage('A valid email is required.'),

        body('address.firstLine')
            .trim()
            .notEmpty()
            .withMessage('firstLine is required')
            .isLength({ min: 2, max: 80 })
            .withMessage('firstLine should have between 2 and 80 characters.'),

        body('address.lastLine')
            .trim()
            .notEmpty()
            .withMessage('lastLine is required')
            .isLength({ min: 2, max: 60 })
            .withMessage('lastLine should have between 2 and 60 characters.')
            .optional(),

        body('address.city')
            .trim()
            .notEmpty()
            .withMessage('city is required')
            .isLength({ min: 2, max: 20 })
            .withMessage('city should have between 2 and 20 characters.'),

        body('membership')
            .trim()
            .notEmpty()
            .withMessage('membership is required.')
            .isBoolean()
            .withMessage('membership should be true or false.'),
    ];
}

/**
 * Validation rules for update a customer.
 * @returns {Array} Validations rules.
 */
customersValidator.updateCustomerRules = () => {
    return [
        param('id')
            .trim()
            .notEmpty()
            .withMessage('Id is required.')
            .isAlphanumeric()
            .withMessage('Id does not have any special character.')
            .isLength({ min: 24, max: 24 })
            .withMessage('Id should have 24 characters.'),

        body('firstName')
            .trim()
            .notEmpty()
            .withMessage('firstName is required')
            .isLength({ min: 2, max: 30 })
            .withMessage('firstName should have between 2 and 30 characters.')
            .optional(),

        body('lastName')
            .trim()
            .notEmpty()
            .withMessage('lastName is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('lastName should between 2 and 50 characters.')
            .optional(),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('email is required')
            .normalizeEmail()
            .isEmail()
            .withMessage('A valid email is required.')
            .optional(),

        body('address.firstLine')
            .trim()
            .notEmpty()
            .withMessage('firstLine is required')
            .isLength({ min: 2, max: 80 })
            .withMessage('firstLine should have between 2 and 80 characters.')
            .optional(),

        body('address.lastLine')
            .trim()
            .notEmpty()
            .withMessage('lastLine is required')
            .isLength({ min: 2, max: 60 })
            .withMessage('lastLine should have between 2 and 60 characters.')
            .optional(),

        body('address.city')
            .trim()
            .notEmpty()
            .withMessage('city is required')
            .isLength({ min: 2, max: 20 })
            .withMessage('city should have between 2 and 20 characters.')
            .optional(),

        body('membership')
            .trim()
            .notEmpty()
            .withMessage('membership is required.')
            .isBoolean()
            .withMessage('membership should be true or false.')
            .optional(),
    ];
}

module.exports = customersValidator;