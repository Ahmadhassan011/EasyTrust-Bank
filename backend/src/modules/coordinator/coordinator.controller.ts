import type { Request, Response } from "express";
const coordinatorService = require("./coordinator.service");
const auditService = require("../audit/audit.service");

const transfer2PC = async (req: Request, res: Response) => {
  try {
    const result = await coordinatorService.executeTwoPhaseCommit(req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "transaction",
      entityId: result.transaction_id,
      action: "2PC_TRANSFER",
      newValue: result,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: "2PC_TRANSFER_FAILED", message: error.message }
    });
  }
};

module.exports = { transfer2PC };
