import type { Request, Response } from "express";
const customerService = require("./customer.service");
const accountService = require("../account/account.service");
const loanService = require("../loan/loan.service");

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

const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAccountsByCustomerId(Number(req.params.id));
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer accounts" });
  }
};

const getLoans = async (req: Request, res: Response) => {
  try {
    const loans = await loanService.getLoansByCustomer(Number(req.params.id));
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer loans" });
  }
};

module.exports = { create, getAll, getById, update, remove, getAccounts, getLoans };
