import type { Request, Response } from "express";
const accountService = require("./account.service");
const auditService = require("../audit/audit.service");

const requireOwnAccount = async (req: Request, accountId: number) => {
  if (req.user?.type !== "customer") return;
  const account = await accountService.getAccountById(accountId);
  if (!account || account.customer_id !== req.user.userId) {
    const err = new Error("Access denied");
    (err as any).statusCode = 403;
    throw err;
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const account = await accountService.createAccount(req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "account",
      entityId: account.account_id,
      action: "CREATE",
      newValue: account,
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
    await requireOwnAccount(req, Number(req.params.id));
    const account = await accountService.getAccountById(Number(req.params.id));
    if (!account) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Account not found" } });
    }
    res.json({ success: true, data: account });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message } });
  }
};

const getByCustomer = async (req: Request, res: Response) => {
  try {
    if (req.user?.type === "customer" && req.user.userId !== Number(req.params.customerId)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    }
    const accounts = await accountService.getAccountsByCustomerId(Number(req.params.customerId));
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch customer accounts", details: error.message } });
  }
};

const getBalance = async (req: Request, res: Response) => {
  try {
    await requireOwnAccount(req, Number(req.params.id));
    const account = await accountService.getAccountById(Number(req.params.id));
    if (!account) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Account not found" } });
    }
    res.json({ success: true, data: { account_id: account.account_id, balance: account.balance } });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message } });
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
      oldValue: oldAccount ? { status: oldAccount.status } : null,
      newValue: { status: account.status },
      ipAddress: req.ip,
    });
    res.json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "UPDATE_FAILED", message: "Failed to update account status", details: error.message } });
  }
};

module.exports = { create, getAll, getById, getByCustomer, getBalance, updateStatus };
