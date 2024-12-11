const Customer = require('../models/Customer');

class CustomerController {
  /**
   * Create a new customer in the database.
   */
  async createCustomer(req, res, next) {
    try {
      const { name, email, phone } = req.body;
      const newCustomer = await Customer.create({ name, email, phone });
      res.status(201).json(newCustomer);
    } catch (error) {
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
      await customer.update({ name, email, phone });
      res.json(customer);
    } catch (error) {
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
      await customer.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
