const salesModel = require('../models/sales.model');
const salesService = require('../services/sales.service');
const utils = require("../utils");
const { ObjectId } = require('mongodb');

const salesController = {};

/**
 * Retrieves a paginated list of sales.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
salesController.getPaginatedSale = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const totalSales = await salesModel.countSales();
        const totalPages = Math.ceil(totalSales / pageSize);
        const skipedItems = (page - 1) * pageSize;
        const sales = await salesModel.getPaginatedSales(skipedItems, pageSize);

        await utils.okPaginatedResponse(res, totalPages, page, sales);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Retrieves a sale by id.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
salesController.getSale = async (req, res) => {
    const id = new ObjectId(String(req.params.id));

    try {
        const sale = await salesModel.getSale(id);

        if (!sale) {
            await utils.notFoundResponse(res, "sale");
            return;
        }

        await utils.okResponse(res, sale);
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Creates a new sale.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
salesController.createSale = async (req, res) => {
    let membershipCode = null;
    if (req.body.membershipCode) {
        membershipCode = req.body.membershipCode;
    }
    const products = req.body.products;

    try {
        const result = await salesService.processSale(products, membershipCode);

        if (result.acknowledged) {
            const createdSale = await salesModel.getSale(result.insertedId)
            await utils.createdObjecResultResponse(res, createdSale);
            return;
        }

        await utils.badRequestResponse(res, "Error while creating a sale.");
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Creates a new sale using membership points.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
salesController.createSaleWithPoints = async (req, res) => {
    const membershipCode = req.body.membershipCode;
    const products = req.body.products;

    try {
        const { errorMessage, result } = await salesService.processSaleWithPoints(products, membershipCode);

        if (errorMessage) {
            await utils.badRequestResponse(res, errorMessage);
            return;
        }

        if (result.acknowledged) {
            const createdSale = await salesModel.getSale(result.insertedId)
            await utils.createdObjecResultResponse(res, createdSale);
            return;
        }

        await utils.badRequestResponse(res, "Error while creating a sale.");
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

/**
 * Cancel a sale.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @returns {Promise<void>} A Promise that resolves after handling the request.
 */
salesController.cancelSale = async (req, res) => {
    const saleId = new ObjectId(String(req.params.id));
    const isCancelled = req.body.isCancelled === 'true';

    try {
        const sale = await salesModel.getSale(saleId);

        if (!sale) {
            await utils.notFoundResponse(res, "sale");
            return;
        }

        const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

        if (errorMessage) {
            await utils.badRequestResponse(res, errorMessage);
            return;
        }

        if (result.matchedCount > 0) {            
            await utils.okResponse(res, {message: "Sale canceled successfully."});
            return;
        }
    } catch (error) {
        await utils.internalServerErrorResponse(res, error);
    }
}

module.exports = salesController;