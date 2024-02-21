const { ObjectId } = require('mongodb');
const productsModel = require('../models/products.model');
const utils = require('../utils');

const productsController = {};

/**
 * Retrieves a paginated list of products.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
productsController.getPaginatedProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const totalProducts = await productsModel.countProducts();
        const totalPages = Math.ceil(totalProducts / pageSize);
        const skipedItems = (page - 1) * pageSize;
        const products = await productsModel.getPaginatedProducts(skipedItems, pageSize);

        await utils.okPaginatedResponse(res, totalPages, page, products);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Retrieves a product by id.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
productsController.getProduct = async (req, res) => {
    const id = new ObjectId(String(req.params.id));

    try {
        const product = await productsModel.getProduct(id);

        if (!product) {
            await utils.notFoundResponse(res, 'product');
            return;
        }

        await utils.okResponse(res, product);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Creates a new product.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
productsController.createProduct = async (req, res) => {
    const product = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        brand: req.body.brand,
        quantity: parseInt(req.body.quantity),
        price: parseFloat(req.body.price),
        pointsPrice: parseInt(req.body.pointsPrice),
    };

    try {
        const result = await productsModel.createProduct(product);

        if (result.acknowledged) {
            const createdProduct = await productsModel.getProduct(result.insertedId)
            await utils.createdObjecResultResponse(res, createdProduct);
            return;
        }

        await utils.badRequestResponse(res, 'Error while creating a product.');
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Updates a product.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
productsController.updateProduct = async (req, res) => {
    const id = new ObjectId(String(req.params.id));
    const product = {};    
    const productFields = ['name', 'description', 'category', 'brand', 'quantity', 'price', 'pointsPrice'];    
    productFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null) {            
            if (field === 'quantity' || field === 'pointsPrice') {
                product[field] = parseInt(req.body[field]);
            } else if (field === 'price') {
                product[field] = parseFloat(req.body[field]);
            } else {
                product[field] = req.body[field];
            }
        }
    });

    try {
        const result = await productsModel.updateProduct(id, product);

        if (result.matchedCount > 0) {
            const updatedProduct = await productsModel.getProduct(id)
            await utils.okResponse(res, updatedProduct);
            return;
        }

        await utils.badRequestResponse(res, 'Error while updating a product.');
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Deletes a product by id.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
productsController.deleteProduct = async (req, res) => {
    const id = new ObjectId(String(req.params.id));

    try {
        const result = await productsModel.deleteProduct(id);

        if (result.deletedCount > 0) {
            await utils.noContentResponse(res);
            return;
        }

        await utils.badRequestResponse(res, 'Error while deleting a product.');
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

module.exports = productsController;