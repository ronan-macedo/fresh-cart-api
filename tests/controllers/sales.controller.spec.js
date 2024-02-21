const { ObjectId } = require('mongodb');
const request = require('supertest');
const sut = require('../configs/server.sut');

const salesModel = require('../../src/models/sales.model');
const salesService = require('../../src/services/sales.service');
const productsModel = require('../../src/models/products.model');
const membershipsModel = require('../../src/models/memberships.model');

// Mocking all the services dependencies.
jest.mock('../../src/models/products.model');
jest.mock('../../src/models/memberships.model');
jest.mock('../../src/services/sales.service');
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

describe('Sales Controller', () => {
    const product = {
        _id: '65a8747d7aaceb61d2c91ecd',
        name: 'Product 2',
        description: 'Product description',
        category: 'Some Category',
        brand: 'No brand',
        quantity: 992,
        price: 1.8,
        pointsPrice: 3
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

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getPaginatedSales', () => {
        test('should handle paginated sales request', async () => {
            // Arrange
            const sales = [
                {
                    _id: '65a8747d7aaceb61d2c91eab',
                    saleDate: '2023-02-10',
                    membershipCode: 'cO2JskE6',
                    products: [
                        {
                            name: 'Some product',
                            quantity: 2,
                            price: 1.5
                        }
                    ],
                    totalAmount: 3,
                    isCancelled: false,
                    points: 1
                }
            ];

            salesModel.countSales.mockResolvedValue(1);
            salesModel.getPaginatedSales.mockResolvedValue(sales);

            // Act
            const response = await request(sut).get('/sale?page=1&pageSize=10');

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                totalPages: 1,
                page: 1,
                results: sales
            });
        });

        test('should handle error in paginated sales request', async () => {
            // Arrange
            const erroMessage = 'Test error.';
            salesModel.countSales.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).get('/sale?page=1&pageSize=2');

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('getSale', () => {
        test('should handle get sale request', async () => {
            // Arrange
            const sale = {
                _id: '65a8747d7aaceb61d2c91eab',
                saleDate: '2023-02-10',
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        name: 'Some product',
                        quantity: 2,
                        price: 1.5
                    }
                ],
                totalAmount: 3,
                isCancelled: false,
                points: 1
            };
            const saleId = sale._id;
            salesModel.getSale.mockResolvedValue(sale);

            // Act
            const response = await request(sut).get(`/sale/${saleId}`);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(sale);
        });

        test('should handle not found in get sale request', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            salesModel.getSale.mockResolvedValue(null);

            // Act
            const response = await request(sut).get(`/sale/${saleId}`);

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: 'sale not found.' });
        });

        test('should handle validation bad request in get sale request', async () => {
            // Arrange
            const saleId = '65a8747d7aa';

            // Act
            const response = await request(sut).get(`/sale/${saleId}`);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        test('should handle error in get sale request', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const erroMessage = 'Test error.'
            salesModel.getSale.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).get(`/sale/${saleId}`);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('createSale', () => {
        test('should handle create sale request', async () => {
            // Arrange
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const createdSale = {
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

            const createResult = { acknowledged: true, insertedId: new ObjectId(createdSale._id) };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);
            salesService.processSale.mockResolvedValue(createResult);
            salesModel.getSale.mockResolvedValue(createdSale);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act
            const response = await request(sut).post('/sale').send(sale);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(createdSale);
        });

        test('should handle create bad request in create sale request', async () => {
            // Arrange
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const createResult = { acknowledged: false };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);
            salesService.processSale.mockResolvedValue(createResult);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act
            const response = await request(sut).post('/sale').send(sale);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while creating a sale.' }
                ]
            });
        });

        test('should handle validation bad request in create sale request', async () => {
            // Arrange
            const sale = {
                membershipCode: '',
                products: []
            };

            // Act
            const response = await request(sut).post('/sale').send(sale);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(1);
        });

        test('should handle error in create sale request', async () => {
            // Arrange
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const erroMessage = 'Test error.'
            const createResult = { acknowledged: false };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);
            salesService.processSale.mockRejectedValue(new Error(erroMessage));
            salesModel.createSale.mockResolvedValue(createResult);

            // Act
            const response = await request(sut).post('/sale').send(sale);

            // Assert
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('createSaleWithPoints', () => {
        test('should handle create sale with points request', async () => {
            // Arrange
            const erroMessage = null;
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const createdSale = {
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

            const createResult = { acknowledged: true, insertedId: new ObjectId(createdSale._id) };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);
            salesService.processSaleWithPoints.mockResolvedValue({ errorMessage: erroMessage, result: createResult });
            salesModel.getSale.mockResolvedValue(createdSale);
            salesModel.createSale.mockResolvedValue(createResult);

            // Act
            const response = await request(sut).post('/sale/points').send(sale);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(createdSale);
        });

        test('should handle error message bad request in create sale with points request', async () => {
            // Arrange
            const erroMessage = 'Test error.';
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const createResult = { acknowledged: false };
            salesService.processSaleWithPoints.mockResolvedValue({ errorMessage: erroMessage, result: createResult });
            membershipsModel.getMembership.mockResolvedValue(membership);
            productsModel.getProduct.mockResolvedValue(product);


            // Act
            const response = await request(sut).post('/sale/points').send(sale);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Test error.' }
                ]
            });
        });

        test('should handle create bad request in create sale with points request', async () => {
            // Arrange
            const erroMessage = null;
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const createResult = { acknowledged: false };
            salesService.processSaleWithPoints.mockResolvedValue({ erroMessage: erroMessage, result: createResult });
            membershipsModel.getMembership.mockResolvedValue(membership);
            productsModel.getProduct.mockResolvedValue(product);

            // Act
            const response = await request(sut).post('/sale/points').send(sale);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while creating a sale.' }
                ]
            });
        });

        test('should handle error in create sale with points request', async () => {
            // Arrange
            const erroMessage = 'Test error.';
            const sale = {
                membershipCode: 'cO2JskE6',
                products: [
                    {
                        productId: '65a8747d7aaceb61d2c91ecd',
                        quantity: 2
                    }
                ]
            };
            const createdSale = {
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

            const createResult = { acknowledged: true, insertedId: new ObjectId(createdSale._id) };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);
            membershipsModel.getMembership.mockResolvedValue(membership);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);
            membershipsModel.getPoints.mockResolvedValue(99);
            salesService.processSaleWithPoints.mockResolvedValue({ errorMessage: null, result: createResult });
            salesModel.getSale.mockRejectedValue(new Error(erroMessage));
            salesModel.createSale.mockResolvedValue(createResult);

            // Act
            const response = await request(sut).post('/sale/points').send(sale);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({error: erroMessage});
        });

        test('should handle validation bad request in create sale with points request', async () => {
            // Arrange
            const sale = {};

            // Act
            const response = await request(sut).post('/sale/points').send(sale);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(1);
        });
    });

    describe('cancelSale', () => {
        test('should handle cancel sale', async () => {
            // Arrange
            const errorMessage = null;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const saleId = '65a8747d7aaceb61d2c91eab';
            const isCancelled = { isCancelled: true };
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
            salesModel.getSale.mockResolvedValue(sale);
            salesService.processSaleCancellation.mockResolvedValue({ errorMessage, result: updateResult });

            // Act
            const response = await request(sut).put(`/sale/${saleId}`).send(isCancelled);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Sale canceled successfully.' });
        });

        test('should handle not found in cancel sale', async () => {
            // Arrange
            const saleId = '65a8747d7aaceb61d2c91eab';
            const isCancelled = { isCancelled: true };
            salesModel.getSale.mockResolvedValue(null);

            // Act
            const response = await request(sut).put(`/sale/${saleId}`).send(isCancelled);

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: 'sale not found.' });
        });

        test('should handle cancel bad request in cancel sale', async () => {
            // Arrange
            const errorMessage = 'Test error.';
            const updateResult = { acknowledged: true, matchedCount: 0 };
            const saleId = '65a8747d7aaceb61d2c91eab';
            const isCancelled = { isCancelled: true };
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
            salesModel.getSale.mockResolvedValue(sale);
            salesService.processSaleCancellation.mockResolvedValue({ errorMessage, updateResult });

            // Act
            const response = await request(sut).put(`/sale/${saleId}`).send(isCancelled);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: errorMessage }
                ]
            });
        });

        test('should handle cancelation bad request in cancel sale', async () => {
            // Arrange
            const errorMessage = null;
            const saleId = '65a8747d7aaceb61d2c91eab';
            const isCancelled = { isCancelled: true };
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
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const updateResultNegative = { acknowledged: true, matchedCount: 0 };
            salesModel.getSale.mockResolvedValue(sale);
            salesService.processSaleCancellation.mockResolvedValue({ errorMessage, result: updateResultNegative });
            productsModel.getProduct.mockResolvedValue(product);
            productsModel.updateProduct.mockResolvedValue(updateResult);

            // Act
            const response = await request(sut).put(`/sale/${saleId}`).send(isCancelled);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while canceling a sale.' }
                ]
            });
        });

        test('should handle validation bad request in cancel sale', async () => {
            // Arrange
            const saleId = '65aceb61d2c91eab';
            const isCancelled = {};

            // Act
            const response = await request(sut).put(`/sale/${saleId}`).send(isCancelled);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(1);
        });

        test('should handle error in cancel sale', async () => {
            // Arrange
            const errorMessage = 'Test error.';
            const saleId = '65a8747d7aaceb61d2c91eab';
            const isCancelled = { isCancelled: true };
            salesModel.getSale.mockRejectedValue(new Error(errorMessage));

            // Act
            const response = await request(sut).put(`/sale/${saleId}`).send(isCancelled);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });
});