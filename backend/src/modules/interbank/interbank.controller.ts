import type { Request, Response } from "express";
const interbankService = require("./interbank.service");
const auditService = require("../audit/audit.service");

const transfer = async (req: Request, res: Response) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const result = await interbankService.createTransfer(req.body, idempotencyKey);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "interbank_transfer",
      entityId: result.transfer_id,
      action: "INTERBANK_TRANSFER",
      newValue: result,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: "INTERBANK_TRANSFER_FAILED", message: error.message },
    });
  }
};

const getSettlementStatus = async (req: Request, res: Response) => {
  try {
    const result = await interbankService.getSettlementStatus(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: { code: "SETTLEMENT_NOT_FOUND", message: error.message },
    });
  }
};

module.exports = { transfer, getSettlementStatus };