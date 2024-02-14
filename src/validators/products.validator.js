const { body, param } = require("express-validator");
const productsValidator = {};

/**
 * Validation rules for register a new product.
 * @returns {Array} Validations rules.
 */
productsValidator.createProductRules = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("name is required.")
            .isLength({ min: 2, max: 30 })
            .withMessage("name should have between 2 and 30 characters."),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("description is required.")
            .isLength({ min: 2, max: 80 })
            .withMessage("description should have between 2 and 80 characters."),

        body("category")
            .trim()
            .notEmpty()
            .withMessage("category is required.")
            .isLength({ min: 2, max: 30 })
            .withMessage("category should have between 2 and 30 characters."),

        body("brand")
            .trim()
            .notEmpty()
            .withMessage("brand is required.")
            .isLength({ min: 2, max: 30 })
            .withMessage("brand should have between 2 and 30 characters."),

        body("quantity")
            .trim()
            .notEmpty()
            .withMessage("quantity is required.")
            .isNumeric({ no_symbols: true })
            .withMessage("quantity should be a number."),

        body("price")
            .trim()
            .notEmpty()
            .withMessage("price is required.")
            .isFloat({ min: 0.01 })
            .withMessage("price cannot be zero."),

        body("pointsPrice")
            .trim()
            .notEmpty()
            .withMessage("pointPrice is required.")
            .isNumeric({ no_symbols: true })
            .withMessage("pointPrice should be a number."),
    ];
}

/**
 * Validation rules for update a product.
 * @returns {Array} Validations rules.
 */
productsValidator.updateProductRules = () => {
    return [
        param("id")
            .trim()
            .notEmpty()
            .withMessage("Id is required.")
            .isAlphanumeric()
            .withMessage("Id does not have any special character.")
            .isLength({ min: 24, max: 24 })
            .withMessage("Id should have 24 characters."),

        body("name")
            .trim()
            .notEmpty()
            .withMessage("name cannot be empty.")
            .isLength({ min: 2, max: 30 })
            .withMessage("name should have between 2 and 30 characters.")
            .optional(),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("description cannot be empty.")
            .isLength({ min: 2, max: 80 })
            .withMessage("description should have between 2 and 80 characters.")
            .optional(),

        body("category")
            .trim()
            .notEmpty()
            .withMessage("category cannot be empty.")
            .isLength({ min: 2, max: 30 })
            .withMessage("category should have between 2 and 30 characters.")
            .optional(),

        body("brand")
            .trim()
            .notEmpty()
            .withMessage("brand cannot be empty.")
            .isLength({ min: 2, max: 30 })
            .withMessage("brand should have between 2 and 30 characters.")
            .optional(),

        body("quantity")
            .trim()
            .notEmpty()
            .withMessage("quantity cannot be empty.")
            .isNumeric({ no_symbols: true })
            .withMessage("quantity should be a number.")
            .optional(),

        body("price")
            .trim()
            .notEmpty()
            .withMessage("price cannot be empty.")
            .isFloat({ min: 0.01 })
            .withMessage("price cannot be zero.")
            .optional(),

        body("pointsPrice")
            .trim()
            .notEmpty()
            .withMessage("pointPrice cannot be empty.")
            .isNumeric({ no_symbols: true })
            .withMessage("pointPrice should be a number.")
            .optional(),
    ];
}

module.exports = productsValidator;