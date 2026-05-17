import type { Request, Response } from "express";
const loanService = require("./loan.service");

const apply = async (req: Request, res: Response) => {
  try {
    const loan = await loanService.applyForLoan(req.body);
    res.status(201).json(loan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const approve = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    const loan = await loanService.approveLoan(Number(req.params.id), Number(employeeId));
    res.json(loan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const getHistory = async (req: Request, res: Response) => {
  try {
    const loans = await loanService.getLoansByCustomer(Number(req.params.customerId));
    res.json(loans);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch loan history" });
  }
};

module.exports = { apply, approve, getHistory };
