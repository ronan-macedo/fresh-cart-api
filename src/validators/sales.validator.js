const { body, param } = require("express-validator");
const { ObjectId } = require('mongodb');
const membershipModel = require("../models/memberships.model");
const productModel = require("../models/products.model");
const salesValidator = {};

/**
 * Validation rules for registering a new sale.
 * @returns {Array} Validations rules.
 */
salesValidator.createSalesRules = () => {
    return [
        body("membershipCode")
            .trim()
            .notEmpty()
            .withMessage("code is required.")
            .isLength({ min: 8, max: 8 })
            .withMessage("customerId should have 8 characters.")
            .custom(async (membershipCode) => {
                const membership = await membershipModel.getMembership(membershipCode);

                if (!membership) {
                    throw new Error("membershipCode does not exist.");
                }

                if (!membership.active) {
                    throw new Error("membershipCode is not active.");
                }
            })
            .optional(),

        body("products")
            .notEmpty()
            .withMessage("products is required."),

        body("products.*.productId")
            .trim()
            .notEmpty()
            .withMessage("productId is required.")
            .isAlphanumeric()
            .withMessage("productId does not have any special character.")
            .isLength({ min: 24, max: 24 })
            .withMessage("productId should have 24 characters.")
            .custom(async (productId) => {
                const id = new ObjectId(String(productId));
                const product = await productModel.getProduct(id);

                if (!product) {
                    throw new Error("product does not exist.");
                }
            }),

        body("products.*.quantity")
            .trim()
            .notEmpty()
            .withMessage("quantity is required.")
            .isInt({ min: 1 })
            .withMessage("quantity should be above 0.")
            .custom(async (quantity, { req, path }) => {
                const index = parseInt(path.split('.')[0].match(/\[(\d+)\]/)[1]);
                const product = req.body.products[index];

                const id = new ObjectId(String(product.productId));
                const existingProduct = await productModel.getProduct(id);

                if (parseInt(quantity) > existingProduct.quantity) {
                    throw new Error(`(${product.productId}) ${existingProduct.name} quantity is greater than available quantity.`);
                }
            }),
    ];
}

/**
 * Validation rules for registering a new sale with points.
 * @returns {Array} Validations rules.
 */
salesValidator.createSalesWithPointsRules = () => {
    return [
        body("membershipCode")
            .trim()
            .notEmpty()
            .withMessage("code is required.")
            .isLength({ min: 8, max: 8 })
            .withMessage("customerId should have 8 characters.")
            .custom(async (membershipCode) => {
                const membership = await membershipModel.getMembership(membershipCode);

                if (!membership) {
                    throw new Error("membershipCode does not exist.");
                }

                if (!membership.active) {
                    throw new Error("membershipCode is not active.");
                }
            }),

        body("products")            
            .notEmpty()
            .withMessage("products is required."),

        body("poducts.*.productId")
            .trim()
            .notEmpty()
            .withMessage("productId is required.")
            .isAlphanumeric()
            .withMessage("productId does not have any special character.")
            .isLength({ min: 24, max: 24 })
            .withMessage("productId should have 24 characters.")
            .custom(async (productId) => {
                const id = ObjectId(productId);
                const product = await productModel.getProduct(id);

                if (!product) {
                    throw new Error("product does not exist.");
                }
            }),

        body("poducts.*.quantity")
            .trim()
            .notEmpty()
            .withMessage("quantity is required.")
            .isInt({ min: 1 })
            .withMessage("quantity should be above 0.")
            .custom(async (quantity, { req, path }) => {
                const index = parseInt(path.split('.')[0].match(/\[(\d+)\]/)[1]);
                const product = req.body.products[index];

                const id = new ObjectId(String(product.productId));
                const existingProduct = await productModel.getProduct(id);

                if (parseInt(quantity) > existingProduct.quantity) {
                    throw new Error(`(${product.productId}) ${existingProduct.name} quantity is greater than available quantity.`);
                }
            }),
    ];
}

/**
 * Validation rules for canceling a sale.
 * @returns {Array} Validations rules.
 */
salesValidator.cancelSaleRules = () => {
    return [
        param("id")
            .trim()
            .notEmpty()
            .withMessage("Id is required.")
            .isAlphanumeric()
            .withMessage("Id does not have any special character.")
            .isLength({ min: 24, max: 24 })
            .withMessage("Id should have 24 characters."),

        body("isCancelled")
            .trim()
            .notEmpty()
            .withMessage("isCancelled is required.")
            .isBoolean()
            .withMessage("isCancelled should be true or false."),
    ];
}

module.exports = salesValidator;