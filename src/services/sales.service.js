const { ObjectId } = require('mongodb');
const salesModel = require('../models/sales.model');
const productsModel = require('../models/products.model');
const membershipsModel = require('../models/memberships.model');

const salesService = {};

/**
 * Process a sale with or without membership.
 * @param {Array<Object>} products An array of product objects.
 * @param {string} membershipCode The membership code, if available.
 * @returns {Promise<Object>} A promise that resolves with the result of the sale processing.
 */
salesService.processSale = async (products, membershipCode) => {
    if (membershipCode) {
        return await processSaleWithMembership(products, membershipCode);
    }

    return await processSaleWithoutMembership(products);
}

/**
 * Process a sale with points redemption.
 * @param {Array<Object>} products An array of product objects.
 * @param {string} membershipCode The membership code associated with the sale.
 * @returns {Promise<Object>} A promise that resolves with the result of the sale processing.
 */
salesService.processSaleWithPoints = async (products, membershipCode) => {
    let result = null;
    let errorMessage = null;
    let membershipPoints = await membershipsModel.getPoints(membershipCode);
    let totalPoints = 0;
    let productList = [];

    for (const item of products) {
        const id = new ObjectId(String(item.productId));
        const storagedProduct = await productsModel.getProduct(id);

        totalPoints += parseInt(item.quantity) * parseInt(storagedProduct.pointsPrice);
    }

    if (membershipPoints < totalPoints) {
        errorMessage = "Not enough points, please choose lower quantities.";
        return { errorMessage, result };
    }

    const sale = {};
    const currentDate = new Date().toISOString().split('T')[0];
    sale.saleDate = currentDate;
    sale.membershipCode = membershipCode;

    for (const item of products) {
        const id = new ObjectId(String(item.productId));
        const storagedProduct = await productsModel.getProduct(id);
        delete storagedProduct._id;

        const product = {
            productId: item.productId,
            productName: storagedProduct.name,
            quantity: parseInt(item.quantity),
            points: parseFloat(storagedProduct.pointsPrice)
        };

        let quantity = parseInt(storagedProduct.quantity) - parseInt(item.quantity);
        storagedProduct.quantity = quantity;

        const updatedProduct = await productsModel.updateProduct(id, storagedProduct);

        if (updatedProduct.matchedCount < 0) {
            throw Error("Error while updating a storaged product.");
        }

        productList.push(product);
    }

    sale.products = productList;
    sale.pointsUsed = totalPoints;
    sale.isCancelled = false;

    result = await salesModel.createSale(sale);

    if (!result.acknowledged) {
        throw Error("Error while creating a sale.");
    }

    await removeMembershipPoints(membershipCode, totalPoints);
    await addPurchasePointsHistory(currentDate, result.insertedId, totalPoints, membershipCode);

    return { errorMessage, result };
}

/**
 * Process the cancellation of a sale.
 * @param {string} saleId The id of the sale to be canceled.
 * @param {boolean} isCancelled A flag indicating whether the sale is to be canceled.
 * @returns {Promise<Object>} A promise that resolves with the result of the sale cancellation.
 */
salesService.processSaleCancellation = async (saleId, isCancelled) => {
    let result = null;
    let errorMessage = null;
    const sale = await salesModel.getSale(saleId);

    if (sale.isCancelled && !isCancelled) {
        errorMessage = "It is not possible to undo a sale cancellation."
        return { errorMessage, result };
    }

    if (!sale.isCancelled && !isCancelled) {
        errorMessage = "Sale is already valid."
        return { errorMessage, result };
    }

    if (sale.isCancelled && isCancelled) {
        errorMessage = "Sale is already canceled."
        return { errorMessage, result };
    }

    result = sale.pointsUsed ?
        await processSaleCancellationWithPoints(sale)
        : sale.membershipCode ?
            await processSaleCancellationWithMembership(sale)
            : await processSaleCancellationWithoutMembership(sale);

    return { errorMessage, result }
}

/**
 * Process products in a sale, updating storaged products and calculating total amount.
 * @param {Array} products An array of products in the sale.
 * @throws Will throw an error if updating storaged products fails.
 * @returns {Object} An object containing updated product list and total amount.
 */
const processProducts = async (products) => {
    let totalAmount = 0;
    let productList = [];
    for (const item of products) {
        const id = new ObjectId(String(item.productId));
        const storagedProduct = await productsModel.getProduct(id);
        delete storagedProduct._id;

        const product = {
            productId: item.productId,
            productName: storagedProduct.name,
            quantity: parseInt(item.quantity),
            price: parseFloat(storagedProduct.price)
        };

        let quantity = parseInt(storagedProduct.quantity) - parseInt(item.quantity);
        storagedProduct.quantity = quantity;
        totalAmount += parseInt(item.quantity) * parseFloat(storagedProduct.price);

        const updatedProduct = await productsModel.updateProduct(id, storagedProduct);

        if (updatedProduct.matchedCount < 0) {
            throw Error("Error while updating a storaged product.");
        }

        productList.push(product);
    }
    return { productList, totalAmount };
}

/**
 * Process a sale with membership.
 * @param {Array<Object>} products An array of product objects.
 * @param {string} membershipCode The membership code.
 * @returns {Promise<Object>} A promise that resolves with the result of the sale processing.
 */
const processSaleWithMembership = async (products, membershipCode) => {
    const sale = {};
    const currentDate = new Date().toISOString().split('T')[0];
    sale.saleDate = currentDate;
    sale.membershipCode = membershipCode;

    const { productList, totalAmount } = await processProducts(products);

    sale.products = productList;
    sale.totalAmount = totalAmount;
    sale.isCancelled = false;

    let points = calculatePoints(totalAmount);
    await addMembershipPoints(membershipCode, points);
    sale.points = points;

    const createdSale = await salesModel.createSale(sale);

    if (!createdSale.acknowledged) {
        throw Error("Error while creating a sale.");
    }

    await addPurchaseHistory(currentDate, createdSale.insertedId, totalAmount, membershipCode);

    return createdSale;
}

/**
 * Process a sale without membership.
 * @param {Array<Object>} products An array of product objects.
 * @returns {Promise<Object>} A promise that resolves with the result of the sale processing.
 */
const processSaleWithoutMembership = async (products) => {
    const sale = {};
    const currentDate = new Date();
    sale.saleDate = currentDate.toISOString().split('T')[0];

    const { productList, totalAmount } = await processProducts(products);

    sale.products = productList;
    sale.totalAmount = totalAmount;
    sale.isCancelled = false;

    return await salesModel.createSale(sale);
}

/**
 * Calculate points based on the total amount.
 * @param {number} totalAmount The total amount for calculating points.
 * @returns {number} The calculated points.
 */
const calculatePoints = (totalAmount) => {
    const convertionRate = 10;
    return Math.floor(totalAmount / convertionRate);
}

/**
 * Add points to a membership.
 * @param {string} membershipCode The membership code.
 * @param {number} points The points to be added.
 * @throws Will throw an error if updating points fails.
 */
const addMembershipPoints = async (membershipCode, points) => {
    const existingMembership = await membershipsModel.getMembership(membershipCode);
    delete existingMembership._id;
    existingMembership.points += points;

    const updatedMembership = await membershipsModel.updateMembership(membershipCode, existingMembership);
    if (updatedMembership.matchedCount < 0) {
        throw Error("Error while adding points to membership.");
    }
}

/**
 * Remove points from a membership.
 * @param {string} membershipCode The membership code.
 * @param {number} points The points to be removed.
 * @throws Will throw an error if updating points fails.
 */
const removeMembershipPoints = async (membershipCode, points) => {
    const existingMembership = await membershipsModel.getMembership(membershipCode);
    delete existingMembership._id;
    existingMembership.points -= points;

    const updatedMembership = await membershipsModel.updateMembership(membershipCode, existingMembership);
    if (updatedMembership.matchedCount < 0) {
        throw Error("Error while removing points to membership.");
    }
}

/**
 * Add purchase history to a membership.
 * @param {string} currentDate The current date.
 * @param {string} saleId The id of the sale.
 * @param {number} totalAmount The total amount of the sale.
 * @param {string} membershipCode The membership code.
 * @throws Will throw an error if updating purchase history fails.
 */
const addPurchaseHistory = async (currentDate, saleId, totalAmount, membershipCode) => {
    const updatedMembership = {};
    const existingMembership = await membershipsModel.getMembership(membershipCode);
    let purchaseList = existingMembership.purchaseHistory ? existingMembership.purchaseHistory : [];
    purchaseList.push({
        saleId: String(saleId),
        date: currentDate,
        amount: totalAmount
    });

    updatedMembership.lastPurchase = currentDate;
    updatedMembership.purchaseHistory = purchaseList;

    const result = await membershipsModel.updateMembership(membershipCode, updatedMembership);
    if (result.matchedCount < 0) {
        throw Error("Error while updating purchase history.");
    }
}

/**
 * Add purchase points history to a membership.
 * @param {string} currentDate - The current date.
 * @param {string} saleId - The ID of the sale.
 * @param {number} totalPoints - The total points used in the sale.
 * @param {string} membershipCode - The membership code.
 * @throws Will throw an error if updating purchase history fails.
 */
const addPurchasePointsHistory = async (currentDate, saleId, totalPoints, membershipCode) => {
    const updatedMembership = {};
    const existingMembership = await membershipsModel.getMembership(membershipCode);
    let purchaseList = existingMembership.purchaseHistory ? existingMembership.purchaseHistory : [];
    purchaseList.push({
        saleId: String(saleId),
        date: currentDate,
        pointsUsed: totalPoints
    });

    updatedMembership.lastPurchase = currentDate;
    updatedMembership.purchaseHistory = purchaseList;

    const result = await membershipsModel.updateMembership(membershipCode, updatedMembership);
    if (result.matchedCount < 0) {
        throw Error("Error while updating purchase history.");
    }
}

/**
 * Remove purchase history from a membership.
 * @param {string} saleId The id of the sale.
 * @param {string} membershipCode The membership code.
 * @throws Will throw an error if updating purchase history fails.
 */
const removePurchaseHistory = async (saleId, membershipCode) => {
    const existingMembership = await membershipsModel.getMembership(membershipCode);
    existingMembership.purchaseHistory = existingMembership.purchaseHistory.filter(item => item.saleId !== String(saleId));

    const result = await membershipsModel.updateMembership(membershipCode, existingMembership);
    if (result.matchedCount < 0) {
        throw Error("Error while updating purchase history.");
    }
}

/**
 * Process the cancellation of a sale with membership.
 * @param {Object} sale The sale object to be canceled.
 * @throws Will throw an error if updating membership points or purchase history fails.
 * @returns {Object} The result of the sale cancellation.
 */
const processSaleCancellationWithMembership = async (sale) => {
    sale.isCancelled = true;
    let points = sale.points;

    for (const item of sale.products) {
        const id = new ObjectId(String(item.productId));
        const storagedProduct = await productsModel.getProduct(id);
        delete storagedProduct._id;

        let quantity = parseInt(storagedProduct.quantity) + parseInt(item.quantity);
        storagedProduct.quantity = quantity;

        const updatedProduct = await productsModel.updateProduct(id, storagedProduct);

        if (updatedProduct.matchedCount < 0) {
            throw Error("Error while updating a storaged product.");
        }
    }

    const result = await salesModel.updateSale(sale._id, sale);

    if (updatedMembership.matchedCount < 0) {
        throw Error("Error while updating a sale.");
    }

    await removeMembershipPoints(sale.membershipCode, points);
    await removePurchaseHistory(sale._id, sale.membershipCode);

    return result;
}

/**
 * Process the cancellation of a sale without membership.
 * @param {Object} sale The sale object to be canceled.
 * @throws Will throw an error if updating storaged products fails.
 * @returns {Object} The result of the sale cancellation.
 */
const processSaleCancellationWithoutMembership = async (sale) => {
    sale.isCancelled = true;

    for (const item of sale.products) {
        const id = new ObjectId(String(item.productId));
        const storagedProduct = await productsModel.getProduct(id);
        delete storagedProduct._id;

        let quantity = parseInt(storagedProduct.quantity) + parseInt(item.quantity);
        storagedProduct.quantity = quantity;

        const updatedProduct = await productsModel.updateProduct(id, storagedProduct);

        if (updatedProduct.matchedCount < 0) {
            throw Error("Error while updating a storaged product.");
        }
    }

    return await salesModel.updateSale(sale._id, sale);
}

/**
 * Process the cancellation of a sale with points.
 * @param {Object} sale The sale object to be canceled.
 * @throws Will throw an error if updating membership points or purchase history fails.
 * @returns {Object} The result of the sale cancellation.
 */
const processSaleCancellationWithPoints = async (sale) => {
    let points = 0;
    sale.isCancelled = true;

    for (const item of sale.products) {
        const id = new ObjectId(String(item.productId));
        const storagedProduct = await productsModel.getProduct(id);

        points += parseInt(item.quantity) * parseInt(storagedProduct.pointsPrice);

        let quantity = parseInt(storagedProduct.quantity) + parseInt(item.quantity);
        storagedProduct.quantity = quantity;

        const updatedProduct = await productsModel.updateProduct(id, storagedProduct);

        if (updatedProduct.matchedCount < 0) {
            throw Error("Error while updating a storaged product.");
        }
    }

    const result = await salesModel.updateSale(sale._id, sale);

    if (result.matchedCount < 0) {
        throw Error("Error while updating a sale.");
    }

    await addMembershipPoints(sale.membershipCode, points);
    await removePurchaseHistory(sale._id, sale.membershipCode);

    return result;
}

module.exports = salesService;