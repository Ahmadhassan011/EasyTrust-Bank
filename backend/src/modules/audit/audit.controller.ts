import type { Request, Response } from "express";
const auditService = require("./audit.service");

const getLogs = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, action, employeeId, fromDate, toDate, limit, offset } = req.query;
    const result = await auditService.getLogs({
      entityType: entityType as string | undefined,
      entityId: entityId ? Number(entityId) : undefined,
      action: action as string | undefined,
      employeeId: employeeId ? Number(employeeId) : undefined,
      fromDate: fromDate as string | undefined,
      toDate: toDate as string | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch audit logs" } });
  }
};

module.exports = { getLogs };
