import type { Request, Response } from "express";
const accountService = require("./account.service");

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "customer" | "employee";
  };
}

const create = async (req: AuthRequest, res: Response) => {
  try {
    // If the authenticated user is a customer, enforce they only create accounts for themselves
    if (req.user?.role === "customer" && req.user.id !== req.body.customer_id) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Customers can only create accounts for themselves" }
      });
    }

    const account = await accountService.createAccount(req.body);
    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error: any) {
    console.error("Create account error:", error);
    res.status(500).json({ success: false, error: { code: "ACCOUNT_CREATION_FAILED", message: error.message } });
  }
};

const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const balanceInfo = await accountService.getAccountBalance(accountId);

    res.json({
      success: true,
      data: balanceInfo
    });
  } catch (error: any) {
    console.error("Get balance error:", error);
    if (error.message === "Account not found") {
      return res.status(404).json({ success: false, error: { code: "ACCOUNT_NOT_FOUND", message: error.message } });
    }
    res.status(500).json({ success: false, error: { code: "BALANCE_RETRIEVAL_FAILED", message: error.message } });
  }
};

const getCustomerAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (req.user?.role === "customer" && req.user.id !== customerId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Customers can only view their own accounts" }
      });
    }

    const accounts = await accountService.getCustomerAccounts(customerId);
    res.json({
      success: true,
      data: accounts
    });
  } catch (error: any) {
    console.error("Get customer accounts error:", error);
    res.status(500).json({ success: false, error: { code: "ACCOUNTS_RETRIEVAL_FAILED", message: error.message } });
  }
};

const issueCard = async (req: AuthRequest, res: Response) => {
  try {
    const card = await accountService.issueCard(req.body);
    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error: any) {
    console.error("Issue card error:", error);
    if (error.message === "Account not found") {
      return res.status(404).json({ success: false, error: { code: "ACCOUNT_NOT_FOUND", message: error.message } });
    }
    res.status(500).json({ success: false, error: { code: "CARD_ISSUANCE_FAILED", message: error.message } });
  }
};

module.exports = {
  create,
  getBalance,
  getCustomerAccounts,
  issueCard
};
