const Customer = require('../models/Customer');
const hubspotService = require('../services/hubspotService');

class CustomerController {
  /**
   * Create a new customer in the database and HubSpot.
   */
  async createCustomer(req, res, next) {
    try {
      const { name, email, phone } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
      }

      // Create customer in local database
      const newCustomer = await Customer.create({ name, email, phone });

      // Create contact in HubSpot
      const hubspotId = await hubspotService.createContact({ name, email, phone });

      // Update local customer with HubSpot ID
      newCustomer.hubspotId = hubspotId;
      await newCustomer.save();

      res.status(201).json(newCustomer);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      next(error);
    }
  }

  /**
   * Retrieve all customers from the database.
   */
  async getAllCustomers(req, res, next) {
    try {
      const customers = await Customer.findAll();
      res.json(customers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve a single customer by ID.
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a customer by ID.
   */
  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Update local customer
      if (name) customer.name = name;
      if (email) customer.email = email;
      if (phone) customer.phone = phone;
      await customer.save();

      // Update contact in HubSpot if hubspotId exists
      if (customer.hubspotId) {
        await hubspotService.updateContact(customer.hubspotId, { name: customer.name, email: customer.email, phone: customer.phone });
      }

      res.json(customer);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      next(error);
    }
  }

  /**
   * Delete a customer by ID.
   */
  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Delete contact from HubSpot if hubspotId exists
      if (customer.hubspotId) {
        await hubspotService.deleteContact(customer.hubspotId);
      }

      await customer.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
