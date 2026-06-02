import type { Request, Response } from "express";
const auditService = require("./audit.service");

const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await auditService.getAuditLogs();
    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ success: false, error: { code: "AUDIT_RETRIEVAL_FAILED", message: error.message } });
  }
};

module.exports = {
  getLogs
};
