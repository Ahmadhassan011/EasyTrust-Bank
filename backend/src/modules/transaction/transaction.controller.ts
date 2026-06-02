import type { Request, Response } from "express";
const transactionService = require("./transaction.service");
const prisma = require("../../config/prisma");

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "customer" | "employee";
  };
}

const deposit = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const { amount } = req.body;

    // Check account ownership if customer
    if (req.user?.role === "customer") {
      const account = await prisma.account.findUnique({ where: { account_id: accountId } });
      if (!account || account.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You can only deposit to your own account" }
        });
      }
    }

    const result = await transactionService.deposit(accountId, amount);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Deposit error:", error);
    res.status(500).json({ success: false, error: { code: "DEPOSIT_FAILED", message: error.message } });
  }
};

const withdraw = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const { amount } = req.body;

    // Check account ownership if customer
    if (req.user?.role === "customer") {
      const account = await prisma.account.findUnique({ where: { account_id: accountId } });
      if (!account || account.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You can only withdraw from your own account" }
        });
      }
    }

    const result = await transactionService.withdraw(accountId, amount);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    if (error.message === "Insufficient funds") {
      return res.status(400).json({ success: false, error: { code: "INSUFFICIENT_FUNDS", message: error.message } });
    }
    res.status(500).json({ success: false, error: { code: "WITHDRAWAL_FAILED", message: error.message } });
  }
};

const transfer = async (req: AuthRequest, res: Response) => {
  try {
    const fromAccountId = Number(req.params.id);
    const { to_account_number, amount, description } = req.body;

    // Check account ownership if customer
    if (req.user?.role === "customer") {
      const account = await prisma.account.findUnique({ where: { account_id: fromAccountId } });
      if (!account || account.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You can only transfer from your own account" }
        });
      }
    }

    const transaction = await transactionService.transfer(fromAccountId, to_account_number, amount, description);
    res.json({
      success: true,
      data: transaction
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    if (error.message === "Insufficient funds" || error.message === "Currency mismatch between accounts" || error.message === "Cannot transfer to the same account") {
      return res.status(400).json({ success: false, error: { code: "TRANSFER_INVALID", message: error.message } });
    }
    if (error.message === "Recipient account not found" || error.message === "Sender account not found") {
      return res.status(404).json({ success: false, error: { code: "ACCOUNT_NOT_FOUND", message: error.message } });
    }
    res.status(500).json({ success: false, error: { code: "TRANSFER_FAILED", message: error.message } });
  }
};

const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Auth required" } });
    }

    const history = await transactionService.getTransactionHistory(req.user.id, req.user.role);
    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    console.error("Get transaction history error:", error);
    res.status(500).json({ success: false, error: { code: "HISTORY_RETRIEVAL_FAILED", message: error.message } });
  }
};

module.exports = {
  deposit,
  withdraw,
  transfer,
  getHistory
};
