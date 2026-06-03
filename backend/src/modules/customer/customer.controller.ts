import type { Request, Response } from "express";
const customerService = require("./customer.service");
const accountService = require("../account/account.service");
const loanService = require("../loan/loan.service");
const auditService = require("../audit/audit.service");

const create = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "customer",
      entityId: customer.customer_id,
      action: "CREATE",
      newValue: JSON.stringify(customer),
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "CREATE_FAILED", message: "Failed to create customer" } });
  }
};

const getAll = async (_req: Request, res: Response) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch customers" } });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.getCustomerById(Number(req.params.id));
    if (!customer) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch customer" } });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "customer",
      entityId: customer.customer_id,
      action: "UPDATE",
      oldValue: JSON.stringify(req.body),
      newValue: JSON.stringify(customer),
      ipAddress: req.ip,
    });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "UPDATE_FAILED", message: "Failed to update customer" } });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.deleteCustomer(Number(req.params.id));
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "customer",
      entityId: customer.customer_id,
      action: "DELETE",
      newValue: JSON.stringify(customer),
      ipAddress: req.ip,
    });
    res.json({ success: true, data: { message: "Customer deleted" } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "DELETE_FAILED", message: "Failed to delete customer" } });
  }
};

const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAccountsByCustomerId(Number(req.params.id));
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch customer accounts" } });
  }
};

const getLoans = async (req: Request, res: Response) => {
  try {
    const loans = await loanService.getLoansByCustomer(Number(req.params.id));
    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch customer loans" } });
  }
};

module.exports = { create, getAll, getById, update, remove, getAccounts, getLoans };
