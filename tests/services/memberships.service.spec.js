const { ObjectId } = require('mongodb');
const membershipsService = require('../../src/services/memberships.service');
const customersModel = require('../../src/models/customers.model');
const membershipsModel = require('../../src/models/memberships.model');

// Mocking all the services dependencies.
jest.mock('../../src/models/memberships.model');
jest.mock('../../src/models/customers.model');
jest.mock('../../src/database/connection', () => {
    const connection = {
        collection: jest.fn().mockReturnThis(),
    };
    return {
        initializeDb: jest.fn(),
        getConnection: jest.fn().mockReturnValue(connection),
    };
});

describe('Membership Service', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('createMembership', () => {
        test('should handle create membership', async () => {
            // Arrange
            const createResult = { acknowledged: true, insertedId: new ObjectId('65a8747d7aaceb61d2c91eab') };
            membershipsModel.createMembership.mockResolvedValue(createResult);

            // Act
            const result = await membershipsService.createMembership();

            // Assert
            expect(result).not.toBeNull();
        });

        test('should handle create membership error in create membership', async () => {
            // Arrange
            const createResult = { acknowledged: false };
            membershipsModel.createMembership.mockResolvedValue(createResult);

            // Act
            const result = await membershipsService.createMembership();

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('deleteMembership', () => {
        test('should handle delete membership', async () => {
            // Arrange
            const membershipCode = "cO2JskE6";
            const deleteResult = { acknowledged: true, deletedCount: 1 };
            membershipsModel.deleteMembership.mockResolvedValue(deleteResult);

            // Act
            const result = await membershipsService.deleteMembership(membershipCode);

            // Assert
            expect(result).toBe(true);
        });

        test('should handle delete membership error in delete membership', async () => {
            // Arrange
            const membershipCode = "cO2JskE6";
            const deleteResult = { acknowledged: true, deletedCount: 0 };
            membershipsModel.deleteMembership.mockResolvedValue(deleteResult);

            // Act
            const result = await membershipsService.deleteMembership(membershipCode);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('activateDeactivateMembership', () => {
        test('should handle activate deactivate membership with membership code', async () => {
            // Arrange
            const customerId = '65a8747d7aaceb61d2c91eab';
            const isActive = true;
            const membershipCode = 'cO2JskE6';
            const updateResult = { acknowledged: true, matchedCount: 1 };
            customersModel.getMembershipCode.mockResolvedValue(membershipCode);
            membershipsModel.updateMembership.mockResolvedValue(updateResult);

            // Act
            const result = await membershipsService.activateDeactivateMembership(customerId, isActive);

            // Assert
            expect(result).not.toBeNull();
        });

        test('should handle activate deactivate membership without membership code', async () => {
            // Arrange
            const customerId = '65a8747d7aaceb61d2c91eab';
            const isActive = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            const createResult = { acknowledged: true, insertedId: new ObjectId('65a8747d7aaceb61d2c91eab') };
            customersModel.getMembershipCode.mockResolvedValue(null);
            membershipsModel.createMembership.mockResolvedValue(createResult);
            customersModel.updateCustomer.mockResolvedValue(updateResult);

            // Act
            const result = await membershipsService.activateDeactivateMembership(customerId, isActive);

            // Assert
            expect(result).not.toBeNull();
        });

        test('should handle membership code error in activate deactivate membership without membership code', async () => {
            // Arrange
            const customerId = '65a8747d7aaceb61d2c91eab';
            const isActive = true;
            const createResult = { acknowledged: false };
            customersModel.getMembershipCode.mockResolvedValue(null);
            membershipsModel.createMembership.mockResolvedValue(createResult);

            // Act
            const result = await membershipsService.activateDeactivateMembership(customerId, isActive);

            // Assert
            expect(result).toBe(false);
        });

        test('should handle does nothing in activate deactivate membership', async () => {
            // Arrange
            customersModel.getMembershipCode.mockResolvedValue(null);
            const customerId = '65a8747d7aaceb61d2c91eab';
            const isActive = null;

            // Act
            const result = await membershipsService.activateDeactivateMembership(customerId, isActive);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('updateMembership', () => {
        test('should handle update membership', async () => {
            // Arrange
            const customerId = '65a8747d7aaceb61d2c91eab';
            const isActive = true;
            const updateResult = { acknowledged: true, matchedCount: 1 };
            membershipsModel.updateMembership.mockResolvedValue(updateResult);

            // Act
            const result = await membershipsService.updateMembership(customerId, isActive);

            // Assert
            expect(result).not.toBeNull();
        });
    });
});