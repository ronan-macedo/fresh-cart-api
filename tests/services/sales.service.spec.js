const { ObjectId } = require('mongodb');
const salesService = require('../../src/services/sales.service');
const productsModel = require('../../src/models/products.model');
const membershipsModel = require('../../src/models/memberships.model');
const salesModel = require('../../src/models/sales.model');

// Mocking all the services dependencies.
jest.mock('../../src/models/memberships.model');
jest.mock('../../src/models/products.model');
jest.mock('../../src/models/sales.model');
jest.mock('../../src/database/connection', () => {
    const connection = {
        collection: jest.fn().mockReturnThis(),
    };
    return {
        initializeDb: jest.fn(),
        getConnection: jest.fn().mockReturnValue(connection),
    };
});

describe('Sales Service', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('processSale', () => {
        test('should handle process sale without membership in process sale', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act
            const result = await salesService.processSale(products, null);

            // Assert
            expect(result.acknowledged).toBe(true);
        });

        test('should handle process sale with membership in process sale', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.createSale.mockResolvedValue(createResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);

            // Act
            const result = await salesService.processSale(products, membershipCode);

            // Assert
            expect(result.acknowledged).toBe(true);
        });

        test('should throw product error in process sale', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const updateResult = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);

            // Act & Assert
            expect(async () => { await salesService.processSale(products, null); })
                .rejects.toThrow('Error while updating a storaged product.');
        });

        test('should throw add membership points error in process sale', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSale(products, membershipCode))
                .rejects.toThrow('Error while adding points to membership.');
        });

        test('should throw add purchase history error in process sale', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValueOnce(updateResult)
                .mockResolvedValueOnce(updateResultNegative);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act & Assert
            await expect(salesService.processSale(products, membershipCode))
                .rejects.toThrow('Error while updating purchase history.');
        });

        test('should throw add sale create error in process sale', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const createResult = { acknowledged: false }
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValueOnce(updateResult)
                .mockResolvedValueOnce(updateResultNegative);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act & Assert
            await expect(salesService.processSale(products, membershipCode))
                .rejects.toThrow('Error while creating a sale.');
        });
    });

    describe('processSaleWithPoints', () => {
        test('should handle process sale with points', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.createSale.mockResolvedValue(createResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);

            // Act
            const { errorMessage, result } = await salesService.processSaleWithPoints(products, membershipCode);

            // Assert
            expect(result.acknowledged).toBe(true);
            expect(errorMessage).toBeNull();
        });

        test('should handle not enough points in process sale with points', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.createSale.mockResolvedValue(createResult);
            membershipsModel.getPoints.mockResolvedValue(0);

            // Act
            const { errorMessage, result } = await salesService.processSaleWithPoints(products, membershipCode);

            // Assert
            expect(result).toBeNull();
            expect(errorMessage).toBe('Not enough points, please choose lower quantities.');
        });

        test('should throw product update error in process sale with points', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const updateResult = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);

            // Act & Assert
            await expect(salesService.processSaleWithPoints(products, membershipCode))
                .rejects.toThrow('Error while updating a storaged product.');
        });

        test('should throw create sale error in process sale with points', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const createResult = { acknowledged: false };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act & Assert
            await expect(salesService.processSaleWithPoints(products, membershipCode))
                .rejects.toThrow('Error while creating a sale.');
        });

        test('should throw add purchase history error in process sale with points', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);
            salesModel.createSale.mockResolvedValue(createResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValueOnce(updateResult)
                .mockResolvedValueOnce(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleWithPoints(products, membershipCode))
                .rejects.toThrow('Error while updating purchase history.');
        });

        test('should throw remove points error in process sale with points', async () => {
            // Arrange
            const products = [
                {
                    productId: '65a8747d7aaceb61d2c91ecd',
                    quantity: 2
                }
            ];
            const membershipCode = 'cO2JskE6';
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const saleId = '72a8747d7aaceb61d2c91eab';
            const createResult = { acknowledged: true, insertedId: new ObjectId(saleId) };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);
            salesModel.createSale.mockResolvedValue(createResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleWithPoints(products, membershipCode))
                .rejects.toThrow('Error while removing points to membership.');
        });
    });

    describe('processSaleCancellation', () => {
        test('should handle process sale cancellation with membership code', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const isCancelled = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.updateSale.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);

            // Act
            const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

            // Assert
            expect(errorMessage).toBeNull();
            expect(result.acknowledged).toBe(true);
        });

        test('should handle process sale cancellation without membership code', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const isCancelled = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.updateSale.mockResolvedValue(updateResult);

            // Act
            const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

            // Assert
            expect(errorMessage).toBeNull();
            expect(result.acknowledged).toBe(true);
        });

        test('should handle process sale cancellation with points', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        points: 2
                    }
                ],
                pointsUsed: 4,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const isCancelled = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.updateSale.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);

            // Act
            const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

            // Assert
            expect(errorMessage).toBeNull();
            expect(result.acknowledged).toBe(true);
        });

        test('should throw product update error in process sale cancellation with membership code', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const isCancelled = true;
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleCancellation(saleId, isCancelled))
                .rejects.toThrow('Error while updating a storaged product.');
        });

        test('should throw sale update error in process sale cancellation without membership code', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const isCancelled = true;
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleCancellation(saleId, isCancelled))
                .rejects.toThrow('Error while updating a storaged product.');
        });

        test('should throw sale update error in process sale cancellation with membership code', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const isCancelled = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.updateSale.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleCancellation(saleId, isCancelled))
                .rejects.toThrow('Error while updating a sale.');
        });

        test('should throw remove purchase history error in process sale cancellation with membership code', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const membership = {
                _id: '65a8747d7aaceb61d2c91eab',
                code: 'cO2JskE6',
                registrationDate: '2018-01-17',
                lastPurchase: '2018-01-17',
                purchaseHistory: [
                    {
                        saleId: '70a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 2
                    },
                    {
                        saleId: '72a8747d7aaceb61d2c91eab',
                        date: '2018-01-17',
                        amount: 28
                    }
                ],
                points: 99,
                active: true
            };
            const isCancelled = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.updateSale.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValueOnce(updateResult)
                .mockResolvedValueOnce(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleCancellation(saleId, isCancelled))
                .rejects.toThrow('Error while updating purchase history.');
        });

        test('should throw update product error in process sale cancellation with points', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        points: 2
                    }
                ],
                pointsUsed: 4,
                isCancelled: false
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 2
            };
            const isCancelled = true;
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleCancellation(saleId, isCancelled))
                .rejects.toThrow('Error while updating a storaged product.');
        });

        test('should throw update sale error in process sale cancellation with points', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        points: 2
                    }
                ],
                pointsUsed: 4,
                isCancelled: false
            };
            const product = {
                _id: '65a8747d7aaceb61d2c91ecd',
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 2
            };
            const isCancelled = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            salesModel.updateSale.mockResolvedValue(updateResultNegative);

            // Act & Assert
            await expect(salesService.processSaleCancellation(saleId, isCancelled))
                .rejects.toThrow('Error while updating a sale.');
        });

        test('should handle not undo sale cancelation in process sale cancellation', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        points: 2
                    }
                ],
                pointsUsed: 4,
                isCancelled: true
            };
            const isCancelled = false;
            salesModel.getSale.mockResolvedValue(sale);

            // Act
            const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

            // Assert
            expect(result).toBeNull();
            expect(errorMessage).toBe('It is not possible to undo a sale cancellation.');
        });

        test('should handle already valid sale in process sale cancellation', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        points: 2
                    }
                ],
                pointsUsed: 4,
                isCancelled: false
            };
            const isCancelled = false;
            salesModel.getSale.mockResolvedValue(sale);

            // Act
            const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

            // Assert
            expect(result).toBeNull();
            expect(errorMessage).toBe('Sale is already valid.');
        });

        test('should handle already canceled sale in process sale cancellation', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        productName: 'Some product',
                        quantity: 2,
                        points: 2
                    }
                ],
                pointsUsed: 4,
                isCancelled: true
            };
            const isCancelled = true;
            salesModel.getSale.mockResolvedValue(sale);

            // Act
            const { errorMessage, result } = await salesService.processSaleCancellation(saleId, isCancelled);

            // Assert
            expect(result).toBeNull();
            expect(errorMessage).toBe('Sale is already canceled.');
        });
    });
});