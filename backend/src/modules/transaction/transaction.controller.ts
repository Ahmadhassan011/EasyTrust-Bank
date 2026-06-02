import type { Request, Response } from "express";
const transactionService = require("./transaction.service");
const auditService = require("../audit/audit.service");

const transfer = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const transaction = await transactionService.executeTransfer(
      Number(fromAccountId), Number(toAccountId), Number(amount), description, idempotencyKey
    );
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "transaction",
      entityId: transaction.transaction_id,
      action: "TRANSFER",
      newValue: JSON.stringify(transaction),
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "TRANSFER_FAILED", message: error.message } });
  }
};

const deposit = async (req: Request, res: Response) => {
  try {
    const { toAccountId, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const transaction = await transactionService.executeDeposit(
      Number(toAccountId), Number(amount), description, idempotencyKey
    );
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "transaction",
      entityId: transaction.transaction_id,
      action: "DEPOSIT",
      newValue: JSON.stringify(transaction),
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "DEPOSIT_FAILED", message: error.message } });
  }
};

const withdraw = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const transaction = await transactionService.executeWithdrawal(
      Number(fromAccountId), Number(amount), description, idempotencyKey
    );
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "transaction",
      entityId: transaction.transaction_id,
      action: "WITHDRAWAL",
      newValue: JSON.stringify(transaction),
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "WITHDRAWAL_FAILED", message: error.message } });
  }
};

const history = async (req: Request, res: Response) => {
  try {
    const { limit, offset, fromDate, toDate } = req.query;
    const result = await transactionService.getTransactionHistory(Number(req.params.accountId), {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      fromDate: fromDate as string | undefined,
      toDate: toDate as string | undefined,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch transaction history" } });
  }
};

module.exports = { transfer, deposit, withdraw, history };
