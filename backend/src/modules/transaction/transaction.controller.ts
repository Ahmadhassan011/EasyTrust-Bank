import type { Request, Response } from "express";
const transactionService = require("./transaction.service");

const transfer = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const transaction = await transactionService.executeTransfer(
      Number(fromAccountId),
      Number(toAccountId),
      Number(amount),
      description,
      idempotencyKey
    );
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const deposit = async (req: Request, res: Response) => {
  try {
    const { toAccountId, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const transaction = await transactionService.executeDeposit(
      Number(toAccountId),
      Number(amount),
      description,
      idempotencyKey
    );
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const withdraw = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const transaction = await transactionService.executeWithdrawal(
      Number(fromAccountId),
      Number(amount),
      description,
      idempotencyKey
    );
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const history = async (req: Request, res: Response) => {
  try {
    const { limit, offset, fromDate, toDate } = req.query;
    const history = await transactionService.getTransactionHistory(
      Number(req.params.accountId),
      {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        fromDate: fromDate as string | undefined,
        toDate: toDate as string | undefined
      }
    );
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
};

module.exports = { transfer, deposit, withdraw, history };
