const { ObjectId } = require('mongodb');
const request = require('supertest');
const sut = require('../configs/server.sut');

const customersModel = require('../../src/models/customers.model');
const membershipsService = require('../../src/services/memberships.service');

// Mocking all the services dependencies.
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

describe('Customers Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getPaginatedCustomers', () => {
    test('should handle paginated customers request', async () => {
      // Arrange
      const customers = [
        {
          _id: '65cb77f989c7ed91e4efa318',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          address: {
            firstLine: 'Main street 01',
            lastLine: 'Apt 4',
            city: 'Smallville'
          },
          membershipCode: '3iPpyclk'
        },
        {
          _id: '65cb780289c7ed91e4efa319',
          firstName: 'Mike',
          lastName: 'Doe',
          email: 'mike.doe@email.com',
          address: {
            firstLine: 'Main street 02',
            lastLine: 'Apt 8',
            city: 'Smallville'
          },
          membershipCode: '1S4N00JK'
        }
      ];

      customersModel.countCustomers.mockResolvedValue(2);
      customersModel.getPaginatedCustomers.mockResolvedValue(customers);

      // Act
      const response = await request(sut).get('/customer?page=1&pageSize=10');

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        totalPages: 1,
        page: 1,
        results: customers
      });
    });

    test('should handle error in paginated customers request', async () => {
      // Arrange
      const erroMessage = 'Test error.';
      customersModel.countCustomers.mockRejectedValue(new Error(erroMessage));

      // Act
      const response = await request(sut).get('/customer?page=1&pageSize=2');

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: erroMessage });
    });
  });

  describe('getCustomer', () => {
    test('should handle get customer request', async () => {
      // Arrange
      const customer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membershipCode: '3iPpyclk'
      };
      const customerId = customer._id;
      customersModel.getCustomer.mockResolvedValue(customer);

      // Act
      const response = await request(sut).get(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(customer);
    });

    test('should handle not found in get customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      customersModel.getCustomer.mockResolvedValue(null)

      // Act
      const response = await request(sut).get(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'customer not found.' });
    });

    test('should handle validation bad request in get customer request', async () => {
      // Arrange
      const customerId = "65cb'@+-asfasfasfasfas64484";
      customersModel.getCustomer.mockResolvedValue(null)

      // Act
      const response = await request(sut).get(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(1);
    });

    test('should handle error in get customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const erroMessage = 'Test error.';
      customersModel.getCustomer.mockRejectedValue(new Error(erroMessage));

      // Act
      const response = await request(sut).get(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: erroMessage });
    });
  });

  describe('getCustomerByMembershipCode', () => {
    test('should hangle get customer by membership code', async () => {
      // Arrange
      const customer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membershipCode: '3iPpyclk'
      };
      const membershipCode = '3iPpyclk';
      customersModel.getCustomerByMembershipCode.mockResolvedValue(customer);

      // Act
      const response = await request(sut).get(`/customer/membership/${membershipCode}`);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(customer);
    });

    test('should hangle get customer by membership code', async () => {
      // Arrange
      const customer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membershipCode: '3iPpyclk'
      };
      const membershipCode = '3iPpyclk';
      customersModel.getCustomerByMembershipCode.mockResolvedValue(customer);

      // Act
      const response = await request(sut).get(`/customer/membership/${membershipCode}`);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(customer);
    });

    test('should hangle not found in get customer by membership code', async () => {
      // Arrange      
      const membershipCode = '3iPpyclk';
      customersModel.getCustomerByMembershipCode.mockResolvedValue(null);

      // Act
      const response = await request(sut).get(`/customer/membership/${membershipCode}`);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'customer not found.' });
    });

    test('should hangle validation bad request in get customer by membership code', async () => {
      // Arrange      
      const membershipCode = '3iPpyclkasdnjasd';

      // Act
      const response = await request(sut).get(`/customer/membership/${membershipCode}`);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should hangle error in get customer by membership code', async () => {
      // Arrange
      const errorMessage = 'Test error.';
      const membershipCode = '3iPpyclk';
      customersModel.getCustomerByMembershipCode.mockRejectedValue(new Error(errorMessage));

      // Act
      const response = await request(sut).get(`/customer/membership/${membershipCode}`);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('createCustomer', () => {
    test('should handle create customer request', async () => {
      // Arrange
      const customer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membership: 'true'
      };
      const customerId = '65cb77f989c7ed91e4efa318';
      const membershipCode = '3iPpyclk';
      const createResult = { acknowledged: true, insertedId: new ObjectId('65cb77f989c7ed91e4efa318') };
      membershipsService.createMembership.mockResolvedValue(membershipCode);
      customersModel.createCustomer.mockResolvedValue(createResult);
      customersModel.getCustomer.mockResolvedValue({ _id: customerId, ...customer, membershipCode: membershipCode });

      // Act
      const response = await request(sut).post('/customer').send(customer);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ _id: customerId, ...customer, membershipCode: membershipCode });
    });

    test('should handle membership code error in create customer request', async () => {
      // Arrange
      const customer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membership: 'true'
      };
      membershipsService.createMembership.mockResolvedValue(null);

      // Act
      const response = await request(sut).post('/customer').send(customer);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while generating a membership code.' }
        ]
      });
    });

    test('should handle creation error in create customer request', async () => {
      // Arrange
      const customer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membership: 'true'
      };
      const membershipCode = '3iPpyclk';
      membershipsService.createMembership.mockResolvedValue(membershipCode);
      customersModel.createCustomer.mockResolvedValue({ acknowledged: false });

      // Act
      const response = await request(sut).post('/customer').send(customer);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while creating a customer.' }
        ]
      });
    });

    test('should handle validation bad request in create customer request', async () => {
      // Arrange
      const customer = {};

      // Act
      const response = await request(sut).post('/customer').send(customer);

      // Arrange
      expect(response.statusCode).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(1);
    });

    test('should handle error in create customer request', async () => {
      // Arrange
      const customer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membership: 'true'
      };
      const erroMessage = 'Test error.';
      membershipsService.createMembership.mockRejectedValue(new Error(erroMessage));

      // Act
      const response = await request(sut).post('/customer').send(customer);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: erroMessage });
    });
  });

  describe('updateCustomer', () => {
    test('should handle without membership code in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const existingCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        }
      };
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        }
      };
      const updateResult = { acknowledged: true, matchedCount: 1 };
      customersModel.getCustomer.mockResolvedValueOnce(existingCustomer)
        .mockResolvedValueOnce({ _id: customerId, ...updateCustomer });
      customersModel.updateCustomer.mockResolvedValue(updateResult);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ _id: customerId, ...updateCustomer });
    });

    test('should handle generate membership code in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const existingCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        }
      };
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membership: 'true'
      };
      const updatedCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membershipCode: '3iPpyclk'
      };
      const updateResult = { acknowledged: true, matchedCount: 1 };
      customersModel.getMembershipCode.mockResolvedValue(null);
      membershipsService.createMembership.mockResolvedValue(updatedCustomer.membershipCode);
      customersModel.getCustomer.mockResolvedValueOnce(existingCustomer)
        .mockResolvedValueOnce(updatedCustomer);
      customersModel.updateCustomer.mockResolvedValue(updateResult);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(updatedCustomer);
    });

    test('should handle generate membership code bad request in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membership: 'true'
      };
      customersModel.getMembershipCode.mockResolvedValue(null);
      membershipsService.createMembership.mockResolvedValue(null);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while generating a membership code.' }
        ]
      });
    });

    test('should handle update membership bad request in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membership: 'true'
      };
      const membershipCode = '3iPpyclk';
      customersModel.getMembershipCode.mockResolvedValue(membershipCode);
      membershipsService.updateMembership.mockResolvedValue(null);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while updating membership.' }
        ]
      });
    });

    test('should handle membership code activation in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const existingCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membershipCode: '3iPpyclk'
      };
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membership: 'true'
      };
      const updatedCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membershipCode: '3iPpyclk'
      };
      const updateResult = { acknowledged: true, matchedCount: 1 };
      customersModel.getMembershipCode.mockResolvedValue(updatedCustomer.membershipCode);
      membershipsService.updateMembership.mockResolvedValue(updateResult);
      customersModel.getCustomer.mockResolvedValueOnce(existingCustomer)
        .mockResolvedValueOnce(updatedCustomer);
      customersModel.updateCustomer.mockResolvedValue(updateResult);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(updatedCustomer);
    });

    test('should handle membership code deactivation in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const existingCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        },
        membershipCode: '3iPpyclk'
      };
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membership: 'false'
      };
      const updatedCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        },
        membershipCode: '3iPpyclk'
      };
      const updateResult = { acknowledged: true, matchedCount: 1 };
      customersModel.getMembershipCode.mockResolvedValue(updatedCustomer.membershipCode);
      membershipsService.updateMembership.mockResolvedValue(updateResult);
      customersModel.getCustomer.mockResolvedValueOnce(existingCustomer)
        .mockResolvedValueOnce(updatedCustomer);
      customersModel.updateCustomer.mockResolvedValue(updateResult);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(updatedCustomer);
    });

    test('should handle validation bad request in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318asdas';
      const updateCustomer = {
        firstName: '',
        lastName: '',
        email: 'mike.smithemail.com',
      };

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(1);
    });

    test('should handle update erro in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const existingCustomer = {
        _id: '65cb77f989c7ed91e4efa318',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        address: {
          firstLine: 'Main street 01',
          lastLine: 'Apt 4',
          city: 'Smallville'
        }
      };
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        }
      };
      const updateResult = { acknowledged: true, matchedCount: 0 };
      customersModel.getCustomer.mockResolvedValueOnce(existingCustomer);
      customersModel.updateCustomer.mockResolvedValue(updateResult);

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while updating a customer.' }
        ]
      });
    });

    test('should handle error in update customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const updateCustomer = {
        firstName: 'Mike',
        lastName: 'Smith',
        email: 'mike.smith@email.com',
        address: {
          firstLine: 'Main street 02',
          lastLine: 'Apt 8',
          city: 'Centerville'
        }
      };
      const erroMessage = 'Test error.';
      customersModel.getMembershipCode.mockRejectedValue(new Error(erroMessage));

      // Act
      const response = await request(sut).put(`/customer/${customerId}`).send(updateCustomer);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: erroMessage });
    });
  });

  describe('deleteCustomer', () => {
    test('should handle delete customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const deleteResult = { acknowledged: true, deletedCount: 1 };
      customersModel.getMembershipCode.mockResolvedValue(null);
      customersModel.deleteCustomer.mockResolvedValue(deleteResult);

      // Act
      const response = await request(sut).delete(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(204);
    });

    test('should handle delete membership code in delete customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const membershipCode = '3iPpyclk'
      const deleteResult = { acknowledged: true, deletedCount: 1 };
      customersModel.getMembershipCode.mockResolvedValue(membershipCode);
      membershipsService.deleteMembership.mockResolvedValue(deleteResult);
      customersModel.deleteCustomer.mockResolvedValue(deleteResult);

      // Act
      const response = await request(sut).delete(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(204);
    });

    test('should handle delete membership code bad request in delete customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const membershipCode = '3iPpyclk'
      customersModel.getMembershipCode.mockResolvedValue(membershipCode);
      membershipsService.deleteMembership.mockResolvedValue(null);

      // Act
      const response = await request(sut).delete(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while deleteing a membership.' }
        ]
      });
    });

    test('should handle delete error in delete customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const deleteResult = { acknowledged: true, deletedCount: 0 };
      customersModel.getMembershipCode.mockResolvedValue(null);
      customersModel.deleteCustomer.mockResolvedValue(deleteResult);

      // Act
      const response = await request(sut).delete(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { error: 'Error while deleting a customer.' }
        ]
      });
    });

    test('should handle validation bad request in delete customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318asdsadasdad';

      // Act
      const response = await request(sut).delete(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should handle error in delete customer request', async () => {
      // Arrange
      const customerId = '65cb77f989c7ed91e4efa318';
      const erroMessage = 'Test error.'
      customersModel.getMembershipCode.mockRejectedValue(new Error(erroMessage));

      // Act
      const response = await request(sut).delete(`/customer/${customerId}`);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: erroMessage });
    });
  });
});
