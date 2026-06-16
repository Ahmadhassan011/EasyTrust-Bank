import type { Request, Response } from "express";
const chequeService = require("./cheque.service");
const auditService = require("../audit/audit.service");

const submit = async (req: Request, res: Response) => {
  try {
    const { account_id, amount, cheque_number, bank_name } = req.body;
    // Ensure customer can only submit for their own account
    if (req.user?.type === "customer") {
      const accountService = require("../account/account.service");
      const account = await accountService.getAccountById(Number(account_id));
      if (!account || account.customer_id !== req.user.userId) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Account does not belong to you" } });
      }
    }

    const request = await chequeService.createChequeRequest({
      account_id: Number(account_id),
      amount: Number(amount),
      cheque_number,
      bank_name,
    });

    await auditService.log({
      employeeId: null,
      entityType: "cheque_deposit_request",
      entityId: request.request_id,
      action: "SUBMIT",
      newValue: request,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "SUBMIT_FAILED", message: error.message } });
  }
};

const approve = async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });

    const request = await chequeService.approveChequeRequest(Number(req.params.id), employeeId);

    await auditService.log({
      employeeId,
      entityType: "cheque_deposit_request",
      entityId: request.request_id,
      action: "APPROVE",
      newValue: request,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "APPROVAL_FAILED", message: error.message } });
  }
};

const reject = async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });

    const { reason } = req.body;
    const request = await chequeService.rejectChequeRequest(Number(req.params.id), employeeId, reason);

    await auditService.log({
      employeeId,
      entityType: "cheque_deposit_request",
      entityId: request.request_id,
      action: "REJECT",
      newValue: request,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "REJECTION_FAILED", message: error.message } });
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const requests = await chequeService.getAllRequests(status);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: error.message } });
  }
};

const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    const requests = await chequeService.getRequestsByCustomer(req.user.userId);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: error.message } });
  }
};

const getOne = async (req: Request, res: Response) => {
  try {
    const request = await chequeService.getRequestById(Number(req.params.id));
    if (!request) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Request not found" } });

    if (req.user?.type === "customer" && request.account.customer_id !== req.user.userId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    }

    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: error.message } });
  }
};

module.exports = { submit, approve, reject, getAll, getMine, getOne };
