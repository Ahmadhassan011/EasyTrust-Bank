import type { Request, Response } from "express";
const loanService = require("./loan.service");

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "customer" | "employee";
  };
}

const apply = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === "customer" && req.user.id !== req.body.customer_id) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Customers can only apply for loans on their own behalf" }
      });
    }

    const loan = await loanService.applyLoan(req.body);
    res.status(201).json({
      success: true,
      data: loan
    });
  } catch (error: any) {
    console.error("Apply loan error:", error);
    res.status(500).json({ success: false, error: { code: "LOAN_APPLICATION_FAILED", message: error.message } });
  }
};

const approve = async (req: AuthRequest, res: Response) => {
  try {
    const loanId = Number(req.params.id);
    const { status } = req.body;
    const employeeId = req.user?.id;

    if (!employeeId) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Employee session missing" } });
    }

    const result = await loanService.approveLoan(loanId, employeeId, status);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Approve loan error:", error);
    if (error.message.includes("does not have an active bank account")) {
      return res.status(400).json({ success: false, error: { code: "DISBURSEMENT_FAILED", message: error.message } });
    }
    res.status(500).json({ success: false, error: { code: "LOAN_REVIEW_FAILED", message: error.message } });
  }
};

const repay = async (req: AuthRequest, res: Response) => {
  try {
    const loanId = Number(req.params.id);
    const { account_id, amount } = req.body;

    const result = await loanService.repayLoan(loanId, account_id, amount);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Repay loan error:", error);
    if (error.message === "Insufficient account balance") {
      return res.status(400).json({ success: false, error: { code: "INSUFFICIENT_FUNDS", message: error.message } });
    }
    res.status(500).json({ success: false, error: { code: "LOAN_REPAYMENT_FAILED", message: error.message } });
  }
};

const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await loanService.getLoans();
    res.json({
      success: true,
      data: loans
    });
  } catch (error: any) {
    console.error("Get all loans error:", error);
    res.status(500).json({ success: false, error: { code: "LOANS_RETRIEVAL_FAILED", message: error.message } });
  }
};

module.exports = {
  apply,
  approve,
  repay,
  getAll
};
