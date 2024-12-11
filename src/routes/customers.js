const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Create a new customer
router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await Customer.create({ name, email, phone });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// Get all customers
router.get("/", async (req, res, next) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// Get a customer by ID
router.get("/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Update a customer by ID
router.put("/:id", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    await customer.update({ name, email, phone });
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Delete a customer by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    await customer.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
