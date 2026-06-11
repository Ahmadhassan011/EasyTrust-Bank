import type { Request, Response } from "express";
const reportsService = require("./reports.service");

const monthlyTransactions = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const result = await reportsService.getMonthlyTransactions(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "REPORT_FAILED", message: "Failed to generate report" },
    });
  }
};

module.exports = { monthlyTransactions };
