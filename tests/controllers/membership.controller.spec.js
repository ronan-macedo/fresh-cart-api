const request = require('supertest');
const sut = require('../configs/server.sut');

const membershipsModel = require('../../src/models/memberships.model');
const customersModel = require('../../src/models/customers.model');
const membershipsService = require('../../src/services/memberships.service');

// Mocking all the services dependencies.
jest.mock('../../src/models/memberships.model');
jest.mock('../../src/models/customers.model');
jest.mock('../../src/services/memberships.service');
jest.mock('../../src/database/connection', () => {
    const connection = {
        collection: jest.fn().mockReturnThis(),
    };
    return {
        initializeDb: jest.fn(),
        getConnection: jest.fn().mockReturnValue(connection),
    };
});

describe('Memberships Controller', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getPaginatedMemberships', () => {
        test('should handle paginated memberships request', async () => {
            // Arrange
            const memberships = [
                {
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
                }
            ];

            membershipsModel.countMemberships.mockResolvedValue(1);
            membershipsModel.getPaginatedMemberships.mockResolvedValue(memberships);

            // Act
            const response = await request(sut).get('/membership?page=1&pageSize=10');

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                totalPages: 1,
                page: 1,
                results: memberships
            });
        });

        test('should handle error in paginated memberships request', async () => {
            // Arrange
            const erroMessage = 'Test error.';
            membershipsModel.countMemberships.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).get('/membership?page=1&pageSize=10');

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('getMembershipByMembershipCode', () => {
        test('should handle get membership by membership code', async () => {
            // Arrange
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
            membershipsModel.getMembership.mockResolvedValue(membership);

            // Act
            const response = await request(sut).get(`/membership/${membership.code}`);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(membership);
        });

        test('should handle not found in get membership by membership code', async () => {
            // Arrange
            const membershipCode = 'cO2JskE6';
            membershipsModel.getMembership.mockResolvedValue(null);

            // Act
            const response = await request(sut).get(`/membership/${membershipCode}`);

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: 'membership not found.' });
        });

        test('should handle validation bad request in get membership by membership code', async () => {
            // Arrange
            const membershipCode = 'cO2JskE6asdasd';

            // Act
            const response = await request(sut).get(`/membership/${membershipCode}`);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        test('should handle error in get membership by membership code', async () => {
            // Arrange
            const membershipCode = 'cO2JskE6';
            const erroMessage = 'Test error.';
            membershipsModel.getMembership.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).get(`/membership/${membershipCode}`);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });

    describe('activateDeactivateMembership', () => {
        test('should handle activate deactivate membership request', async () => {
            // Arrange
            const membershipRequest = {
                customerId: '65a8747d7aaceb61d2c91eab',
                membership: 'true'
            }
            const membershipCode = 'cO2JskE6';
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
            membershipsService.activateDeactivateMembership.mockResolvedValue(true);
            customersModel.getMembershipCode.mockResolvedValue(membershipCode);
            membershipsModel.getMembership.mockResolvedValue(membership);

            // Act
            const response = await request(sut).post('/membership').send(membershipRequest);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(membership);
        });

        test('should handle membership error in activate deactivate membership request', async () => {
            // Arrange
            const membershipRequest = {
                customerId: '65a8747d7aaceb61d2c91eab',
                membership: 'true'
            };
            membershipsService.activateDeactivateMembership.mockResolvedValue(false);

            // Act
            const response = await request(sut).post('/membership').send(membershipRequest);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    { error: 'Error while handling membership.' }
                ]
            });
        });

        test('should handle validation bad request in activate deactivate membership request', async () => {
            // Arrange
            const membershipRequest = {
                customerId: '',
                membership: ''
            };

            // Act
            const response = await request(sut).post('/membership').send(membershipRequest);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(1);
        });

        test('should handle error in activate deactivate membership request', async () => {
            // Arrange
            const membershipRequest = {
                customerId: '65a8747d7aaceb61d2c91eab',
                membership: 'true'
            };
            const erroMessage = 'Test error.';
            membershipsService.activateDeactivateMembership.mockRejectedValue(new Error(erroMessage));

            // Act
            const response = await request(sut).post('/membership').send(membershipRequest);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: erroMessage });
        });
    });
});