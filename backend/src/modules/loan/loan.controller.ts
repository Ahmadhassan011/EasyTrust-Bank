import type { Request, Response } from "express";
const loanService = require("./loan.service");
const auditService = require("../audit/audit.service");

const requireOwnCustomer = (req: Request, customerId: number) => {
  if (req.user?.type === "customer" && req.user.userId !== customerId) {
    const err = new Error("Access denied");
    (err as any).statusCode = 403;
    throw err;
  }
};

const apply = async (req: Request, res: Response) => {
  try {
    requireOwnCustomer(req, Number(req.body.customer_id));
    const loan = await loanService.applyForLoan(req.body);
    res.status(201).json({ success: true, data: loan });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "APPLICATION_FAILED", message: error.message } });
  }
};

const approve = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    const loan = await loanService.approveLoan(Number(req.params.id), Number(employeeId));
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "loan",
      entityId: loan.loan_id,
      action: "APPROVE",
      newValue: loan,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: loan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "APPROVAL_FAILED", message: error.message } });
  }
};

const reject = async (req: Request, res: Response) => {
  try {
    const { employeeId, reason } = req.body;
    const loan = await loanService.rejectLoan(Number(req.params.id), Number(employeeId), reason);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "loan",
      entityId: loan.loan_id,
      action: "REJECT",
      newValue: loan,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: loan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "REJECTION_FAILED", message: error.message } });
  }
};

const repay = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, amount } = req.body;
    if (req.user?.type === "customer") {
      const loan = await loanService.getLoanById(Number(req.params.id));
      if (!loan || loan.customer_id !== req.user.userId) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
      }
    }
    const repayment = await loanService.makeRepayment(Number(req.params.id), Number(fromAccountId), Number(amount));
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "loan_repayment",
      entityId: Number(req.params.id),
      action: "REPAY",
      newValue: repayment,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: repayment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "REPAYMENT_FAILED", message: error.message } });
  }
};

const getHistory = async (req: Request, res: Response) => {
  try {
    requireOwnCustomer(req, Number(req.params.customerId));
    const loans = await loanService.getLoansByCustomer(Number(req.params.customerId));
    res.json({ success: true, data: loans });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message } });
  }
};

module.exports = { apply, approve, reject, repay, getHistory };
