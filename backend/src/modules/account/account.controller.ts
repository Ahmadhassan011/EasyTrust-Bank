import type { Request, Response } from "express";
const accountService = require("./account.service");
const auditService = require("../audit/audit.service");

const create = async (req: Request, res: Response) => {
  try {
    const account = await accountService.createAccount(req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "account",
      entityId: account.account_id,
      action: "CREATE",
      newValue: JSON.stringify(account),
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "CREATE_FAILED", message: "Failed to create account", details: error.message } });
  }
};

const getAll = async (_req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch accounts", details: error.message } });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const account = await accountService.getAccountById(Number(req.params.id));
    if (!account) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Account not found" } });
    }
    res.json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch account", details: error.message } });
  }
};

const getByCustomer = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAccountsByCustomerId(Number(req.params.customerId));
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch customer accounts", details: error.message } });
  }
};

const getBalance = async (req: Request, res: Response) => {
  try {
    const account = await accountService.getAccountById(Number(req.params.id));
    if (!account) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Account not found" } });
    }
    res.json({ success: true, data: { account_id: account.account_id, balance: account.balance } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch balance", details: error.message } });
  }
};

const updateStatus = async (req: Request, res: Response) => {
  try {
    const oldAccount = await accountService.getAccountById(Number(req.params.id));
    const account = await accountService.updateAccountStatus(Number(req.params.id), req.body.status);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "account",
      entityId: account.account_id,
      action: "UPDATE_STATUS",
      oldValue: oldAccount ? JSON.stringify({ status: oldAccount.status }) : null,
      newValue: JSON.stringify({ status: account.status }),
      ipAddress: req.ip,
    });
    res.json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "UPDATE_FAILED", message: "Failed to update account status", details: error.message } });
  }
};

module.exports = { create, getAll, getById, getByCustomer, getBalance, updateStatus };
