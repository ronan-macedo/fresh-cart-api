const { ObjectId } = require('mongodb');
const request = require('supertest');
const sut = require('../configs/server.sut');

const productsModel = require('../../src/models/products.model');

// Mocking all the services dependencies.
jest.mock('../../src/models/products.model');
jest.mock('../../src/database/connection', () => {
    const connection = {
        collection: jest.fn().mockReturnThis(),
    };
    return {
        initializeDb: jest.fn(),
        getConnection: jest.fn().mockReturnValue(connection),
    };
});

describe('Products Controller', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getPaginatedProducts', () => {
        test('should handle paginated products request', async () => {
            // Arrange
            const products = [
                {
                    _id: '65cb7bd4b9ec919e44d5226e',
                    name: 'Product 1 Updated',
                    description: 'Product description',
                    category: 'Some Category',
                    brand: 'No brand',
                    quantity: 991,
                    price: 1.8,
                    pointsPrice: 6
                },
                {
                    _id: '65cb9e8187f54cfe23e5a0ef',
                    name: 'Product 2',
                    description: 'Product description',
                    category: 'Some Category',
                    brand: 'No brand',
                    quantity: 992,
                    price: 1.8,
                    pointsPrice: 3
                }
            ];

            productsModel.countProducts.mockResolvedValue(2);
            productsModel.getPaginatedProducts.mockResolvedValue(products);

            // Act
            const response = await request(sut).get('/product?page=1&pageSize=10');

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                totalPages: 1,
                page: 1,
                results: products
            });
        });

        test('should handle error in paginated products request', async () => {
            // Arrange
            const erroMessage = 'Test error.';
            productsModel.countProducts.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).get('/product?page=1&pageSize=2');

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('getProduct', () => {
        test('should handle get product request', async () => {
            // Arrange
            const product = {
                _id: '65cb7bd4b9ec919e44d5226e',
                name: 'Product 1 Updated',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 991,
                price: 1.8,
                pointsPrice: 6
            }
            productsModel.getProduct.mockResolvedValue(product);

            // Act
            const response = await request(sut).get(`/product/${product._id}`);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(product);
        });

        test('should handle not found in get product request', async () => {
            // Arrange
            const productId = '65cb7bd4b9ec919e44d5226e';
            productsModel.getProduct.mockResolvedValue(null);

            // Act
            const response = await request(sut).get(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: 'product not found.' });
        });

        test('should handle validation bad request in get product request', async () => {
            // Arrange
            const productId = '65cbasd5226e';

            // Act
            const response = await request(sut).get(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        test('should handle error in get product request', async () => {
            // Arrange
            const productId = '65cb7bd4b9ec919e44d5226e';
            const erroMessage = 'Test error.';
            productsModel.getProduct.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).get(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('createProduct', () => {
        test('should handle create product request', async () => {
            // Arrange
            const product = {
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const productId = '65a8747d7aaceb61d2c91eab';
            const createResult = { acknowledged: true, insertedId: new ObjectId(productId) };
            productsModel.createProduct.mockResolvedValue(createResult);
            productsModel.getProduct.mockResolvedValue({ _id: productId, ...product });

            // Act
            const response = await request(sut).post('/product').send(product);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({ _id: productId, ...product });
        });

        test('should handle creation bad request in create product request', async () => {
            // Arrange
            const product = {
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const createResult = { acknowledged: false };
            productsModel.createProduct.mockResolvedValue(createResult);

            // Act
            const response = await request(sut).post('/product').send(product);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while creating a product.' }
                ]
            });
        });

        test('should handle validation bad request in create product request', async () => {
            // Arrange
            const product = {};

            // Act
            const response = await request(sut).post('/product').send(product);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(1);
        });

        test('should handle error in create product request', async () => {
            // Arrange
            const product = {
                name: 'Product 1',
                description: 'Product description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const erroMessage = 'Test error.'
            productsModel.createProduct.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).post('/product').send(product);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('updateProduct', () => {
        test('should handle update product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const product = {
                name: 'Product Update 1',
                description: 'Product update description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const updatedProduct = {
                name: 'Product Update 1',
                description: 'Product update description',
                category: 'Some Category',
                brand: 'No brand',
                quantity: 50,
                price: 1.8,
                pointsPrice: 6
            };
            const updateResult = { acknowledged: true, matchedCount: 1 };
            productsModel.updateProduct.mockResolvedValue(updateResult);
            productsModel.getProduct.mockResolvedValue(updatedProduct);

            // Act
            const response = await request(sut).put(`/product/${productId}`).send(product);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(updatedProduct);
        });

        test('should handle update bad request in update product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const product = {
                name: 'Product Update 1',
                description: 'Product update description'
            };
            const updateResult = { acknowledged: true, matchedCount: 0 };
            productsModel.updateProduct.mockResolvedValue(updateResult);

            // Act
            const response = await request(sut).put(`/product/${productId}`).send(product);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while updating a product.' }
                ]
            });
        });

        test('should handle validation bad request in update product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const product = {
                name: '',
                description: ''
            };

            // Act
            const response = await request(sut).put(`/product/${productId}`).send(product);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(1);
        });

        test('should handle error in update product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const product = {
                name: 'Product Update 1',
                description: 'Product update description'
            };
            const erroMessage = 'Test error.'
            productsModel.updateProduct.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).put(`/product/${productId}`).send(product);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('deleteProduct', () => {
        test('should handle delete product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const deleteResult = { acknowledged: true, deletedCount: 1 };
            productsModel.deleteProduct.mockResolvedValue(deleteResult);

            // Act
            const response = await request(sut).delete(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(204);
        });

        test('should handle delete bad request in delete product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const deleteResult = { acknowledged: true, deletedCount: 0 };
            productsModel.deleteProduct.mockResolvedValue(deleteResult);

            // Act
            const response = await request(sut).delete(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while deleting a product.' }
                ]
            });
        });

        test('should handle validation bad request in delete product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eaasdasdb';

            // Act
            const response = await request(sut).delete(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        test('should handle error in delete product request', async () => {
            // Arrange
            const productId = '65a8747d7aaceb61d2c91eab';
            const erroMessage = 'Test error.';
            productsModel.deleteProduct.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).delete(`/product/${productId}`);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });
});