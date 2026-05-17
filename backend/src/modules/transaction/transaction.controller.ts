import type { Request, Response } from "express";
const transactionService = require("./transaction.service");

const transfer = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    const transaction = await transactionService.executeTransfer(
      Number(fromAccountId),
      Number(toAccountId),
      Number(amount),
      description
    );
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const history = async (req: Request, res: Response) => {
  try {
    const history = await transactionService.getTransactionHistory(Number(req.params.accountId));
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
};

module.exports = { transfer, history };
