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
      newValue: customer,
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

const requireOwnCustomer = (req: Request, customerId: number) => {
  if (req.user?.type === "customer" && req.user.userId !== customerId) {
    const err = new Error("Access denied");
    (err as any).statusCode = 403;
    throw err;
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.getCustomerById(Number(req.params.id));
    if (!customer) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    }
    requireOwnCustomer(req, customer.customer_id);
    res.json({ success: true, data: customer });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message } });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    requireOwnCustomer(req, Number(req.params.id));
    const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "customer",
      entityId: customer.customer_id,
      action: "UPDATE",
      oldValue: req.body,
      newValue: customer,
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
      newValue: customer,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: { message: "Customer deleted" } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "DELETE_FAILED", message: "Failed to delete customer" } });
  }
};

const getAccounts = async (req: Request, res: Response) => {
  try {
    requireOwnCustomer(req, Number(req.params.id));
    const accounts = await accountService.getAccountsByCustomerId(Number(req.params.id));
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message } });
  }
};

const getLoans = async (req: Request, res: Response) => {
  try {
    requireOwnCustomer(req, Number(req.params.id));
    const loans = await loanService.getLoansByCustomer(Number(req.params.id));
    res.json({ success: true, data: loans });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message } });
  }
};

module.exports = { create, getAll, getById, update, remove, getAccounts, getLoans };
