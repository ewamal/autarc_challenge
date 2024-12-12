// tests/routes/customers.test.js

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const customerRoutes = require('../../src/routes/customers');
const errorHandler = require('../../src/middlewares/errorHandler');
const Customer = require('../../src/models/Customer'); 
const hubspotService = require('../../src/services/hubspotService');
const { ValidationError } = require('sequelize');

// Mock the Customer model
jest.mock('../../src/models/Customer');

// Mock the HubspotService
jest.mock('../../src/services/hubspotService');

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
    const mockHubspotId = '84024762711';
    const newCustomer = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      hubspotId: mockHubspotId,
      createdAt: '2024-12-11T22:30:13.829Z',
      updatedAt: '2024-12-11T22:30:13.829Z',
      save: jest.fn().mockResolvedValue(),
      toJSON: function() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          phone: this.phone,
          hubspotId: this.hubspotId,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      }
    };

    Customer.create.mockResolvedValue(newCustomer);

    hubspotService.createContact.mockResolvedValue(mockHubspotId);

    const response = await request(app)
      .post('/api/customers')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      hubspotId: mockHubspotId,
      createdAt: '2024-12-11T22:30:13.829Z',
      updatedAt: '2024-12-11T22:30:13.829Z',
    });
    expect(Customer.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    });
    expect(hubspotService.createContact).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    });
    expect(newCustomer.save).toHaveBeenCalled();
  });

  test('POST /api/customers - handles validation errors', async () => {
    const validationError = new ValidationError('Validation Error', [
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
        name: 'John Doe', 
        email: 'invalid-email', 
        phone: '1234567890',
      })
      .expect(400);

    expect(response.body).toEqual({
      message: 'Email must be a valid email address',
    });
    expect(Customer.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'invalid-email',
      phone: '1234567890',
    });
    expect(hubspotService.createContact).not.toHaveBeenCalled();
  });

  test('GET /api/customers - gets all customers', async () => {
    const customers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        hubspotId: '84024762711',
        createdAt: '2024-12-11T22:30:13.829Z',
        updatedAt: '2024-12-11T22:30:13.829Z',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '0987654321',
        hubspotId: '84024762712',
        createdAt: '2024-12-11T22:30:13.829Z',
        updatedAt: '2024-12-11T22:30:13.829Z',
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
      hubspotId: '84024762711',
      createdAt: '2024-12-11T22:30:13.835Z',
      updatedAt: '2024-12-11T22:30:13.835Z',
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
      phone: '1234567890', 
      hubspotId: '84024762711',
      createdAt: '2024-12-11T22:30:13.835Z',
      updatedAt: '2024-12-11T22:30:13.835Z',
    };

    const mockCustomerInstance = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      hubspotId: '84024762711',
      createdAt: '2024-12-11T22:30:13.835Z',
      updatedAt: '2024-12-11T22:30:13.835Z',
      save: jest.fn().mockResolvedValue(),
    };

    Customer.findByPk.mockResolvedValue(mockCustomerInstance);

    hubspotService.updateContact.mockResolvedValue();

    const response = await request(app)
      .put('/api/customers/1')
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      })
      .expect(200);

    expect(response.body).toEqual({
      id: '1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '1234567890',
      hubspotId: '84024762711',
      createdAt: '2024-12-11T22:30:13.835Z',
      updatedAt: '2024-12-11T22:30:13.835Z',
    });
    expect(Customer.findByPk).toHaveBeenCalledWith('1');
    expect(mockCustomerInstance.save).toHaveBeenCalled();
    expect(hubspotService.updateContact).toHaveBeenCalledWith('84024762711', {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '1234567890', 
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
    expect(hubspotService.updateContact).not.toHaveBeenCalled();
  });

  test('DELETE /api/customers/:id - deletes customer by ID', async () => {
    const mockCustomerInstance = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      hubspotId: '84024762711',
      createdAt: '2024-12-11T22:30:13.835Z',
      updatedAt: '2024-12-11T22:30:13.835Z',
      destroy: jest.fn().mockResolvedValue(),
    };
    Customer.findByPk.mockResolvedValue(mockCustomerInstance);

    hubspotService.deleteContact.mockResolvedValue();

    const response = await request(app)
      .delete('/api/customers/1')
      .expect(204);

    expect(response.body).toEqual({});
    expect(Customer.findByPk).toHaveBeenCalledWith('1');
    expect(mockCustomerInstance.destroy).toHaveBeenCalled();
    expect(hubspotService.deleteContact).toHaveBeenCalledWith('84024762711');
  });

  test('DELETE /api/customers/:id - returns 404 if customer not found', async () => {
    Customer.findByPk.mockResolvedValue(null);

    const response = await request(app)
      .delete('/api/customers/999')
      .expect(404);

    expect(response.body).toEqual({ message: 'Customer not found' });
    expect(Customer.findByPk).toHaveBeenCalledWith('999');
    expect(hubspotService.deleteContact).not.toHaveBeenCalled();
  });
});
