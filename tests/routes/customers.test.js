const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const customerRoutes = require('../../src/routes/customers');
const errorHandler = require('../../src/middlewares/errorHandler');
const Customer = require('../../src/models/Customer'); 
const { ValidationError } = require('sequelize');

jest.mock('../../src/models/Customer');

const app = express();
app.use(bodyParser.json());
app.use('/api/customers', customerRoutes);
app.use(errorHandler);

describe('Customer API Endpoints', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  let customerId;

  test('POST /api/customers - creates a new customer', async () => {
    const newCustomer = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };

    Customer.create.mockResolvedValue(newCustomer);

    const response = await request(app)
      .post('/api/customers')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      })
      .expect(201);

    expect(response.body).toEqual(newCustomer);
    expect(Customer.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    });

    customerId = response.body.id;
  });

  test('POST /api/customers - handles errors', async () => {
    const validationError = new ValidationError('Validation Error', [
      {
        message: 'Name cannot be empty',
        type: 'notNull Violation',
        path: 'name',
        value: '',
      },
      {
        message: 'Email must be a valid email address',
        type: 'Validation error',
        path: 'email',
        value: 'invalid-email',
      },
    ]);

    Customer.create.mockRejectedValue(validationError);

    const response = await request(app)
      .post('/api/customers')
      .send({
        name: '',
        email: 'invalid-email',
        phone: '1234567890',
      })
      .expect(400);

    expect(response.body).toEqual({
      message: 'Name cannot be empty, Email must be a valid email address',
    });
    expect(Customer.create).toHaveBeenCalledWith({
      name: '',
      email: 'invalid-email',
      phone: '1234567890',
    });
  });

  test('GET /api/customers - gets all customers', async () => {
    const customers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '0987654321',
      },
    ];

    Customer.findAll.mockResolvedValue(customers);

    const response = await request(app)
      .get('/api/customers')
      .expect(200);

    expect(response.body).toEqual(customers);
    expect(Customer.findAll).toHaveBeenCalled();
  });

  test('GET /api/customers/:id - gets customer by ID', async () => {
    const customer = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };

    Customer.findByPk.mockResolvedValue(customer);

    const response = await request(app)
      .get('/api/customers/1')
      .expect(200);

    expect(response.body).toEqual(customer);
    expect(Customer.findByPk).toHaveBeenCalledWith('1');
  });

  test('GET /api/customers/:id - returns 404 if customer not found', async () => {
    Customer.findByPk.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/customers/999')
      .expect(404);

    expect(response.body).toEqual({ message: 'Customer not found' });
    expect(Customer.findByPk).toHaveBeenCalledWith('999');
  });

  test('PUT /api/customers/:id - updates customer by ID', async () => {
    const updatedCustomer = {
      id: '1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    };

    const mockCustomerInstance = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      update: jest.fn().mockImplementation(async (data) => {
        // Simulate updating the customer instance
        Object.assign(mockCustomerInstance, data);
        return mockCustomerInstance;
      }),
    };
    Customer.findByPk.mockResolvedValue(mockCustomerInstance);

    const response = await request(app)
      .put('/api/customers/1')
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      })
      .expect(200);

    expect(response.body).toEqual(updatedCustomer);
    expect(Customer.findByPk).toHaveBeenCalledWith('1');
    expect(mockCustomerInstance.update).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
  });

  test('PUT /api/customers/:id - returns 404 if customer not found', async () => {
    Customer.findByPk.mockResolvedValue(null);

    const response = await request(app)
      .put('/api/customers/999')
      .send({
        name: 'Nonexistent User',
        email: 'nonexistent@example.com',
      })
      .expect(404);

    expect(response.body).toEqual({ message: 'Customer not found' });
    expect(Customer.findByPk).toHaveBeenCalledWith('999');
  });

  test('DELETE /api/customers/:id - deletes customer by ID', async () => {
    // Mock the Customer.findByPk method to resolve with a customer instance
    const mockCustomerInstance = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      destroy: jest.fn().mockResolvedValue(),
    };
    Customer.findByPk.mockResolvedValue(mockCustomerInstance);

    const response = await request(app)
      .delete('/api/customers/1')
      .expect(204);

    expect(response.body).toEqual({});
    expect(Customer.findByPk).toHaveBeenCalledWith('1');
    expect(mockCustomerInstance.destroy).toHaveBeenCalled();
  });

  test('DELETE /api/customers/:id - returns 404 if customer not found', async () => {
    // Mock the Customer.findByPk method to resolve with null
    Customer.findByPk.mockResolvedValue(null);

    const response = await request(app)
      .delete('/api/customers/999')
      .expect(404);

    expect(response.body).toEqual({ message: 'Customer not found' });
    expect(Customer.findByPk).toHaveBeenCalledWith('999');
  });
});
