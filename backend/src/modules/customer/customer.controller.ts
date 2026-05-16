import type { Request, Response } from "express";

//  1. Delete the mock object and require your real service file here:
const customerService = require("./customer.service"); 

const create = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to create customer" });
  }
};

const getAll = async (_req: Request, res: Response) => {
  try {
    // 2. This will now successfully invoke Prisma inside your service file!
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.getCustomerById(Number(req.params.id));
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.updateCustomer(
      Number(req.params.id),
      req.body
    );
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to update customer" });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await customerService.deleteCustomer(Number(req.params.id));
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
};

// Use CommonJS export to avoid ESM/CommonJS mismatch when verbatimModuleSyntax is enabled
module.exports = { create, getAll, getById, update, remove };