import type { Request, Response } from "express";
const accountService = require("./account.service");

const create = async (req: Request, res: Response) => {
  try {
    const account = await accountService.createAccount(req.body);
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create account", details: error.message });
  }
};

const getAll = async (_req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch accounts", details: error.message });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const account = await accountService.getAccountById(Number(req.params.id));
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch account", details: error.message });
  }
};

const getByCustomer = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAccountsByCustomerId(Number(req.params.customerId));
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch customer accounts", details: error.message });
  }
};

const updateStatus = async (req: Request, res: Response) => {
  try {
    const account = await accountService.updateAccountStatus(
      Number(req.params.id),
      req.body.status
    );
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update account status", details: error.message });
  }
};

module.exports = { create, getAll, getById, getByCustomer, updateStatus };
