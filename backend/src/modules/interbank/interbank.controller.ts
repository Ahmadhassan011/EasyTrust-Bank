import type { Request, Response } from "express";
const interbankService = require("./interbank.service");
const prisma = require("../../config/prisma");

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "customer" | "employee";
  };
}

const transfer = async (req: AuthRequest, res: Response) => {
  try {
    const { sender_account_id } = req.body;

    // Check account ownership if customer
    if (req.user?.role === "customer") {
      const account = await prisma.account.findUnique({ where: { account_id: sender_account_id } });
      if (!account || account.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You can only transfer from your own account" }
        });
      }
    }

    const result = await interbankService.initiateTransfer(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Interbank transfer error:", error);
    
    if (error.message.includes("locked")) {
      return res.status(409).json({ success: false, error: { code: "LOCKED", message: error.message } });
    }
    if (error.message.includes("Insufficient balance") || error.message.includes("inactive") || error.message.includes("refused")) {
      return res.status(400).json({ success: false, error: { code: "TRANSFER_FAILED", message: error.message } });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: error.message } });
    }
    
    res.status(500).json({ success: false, error: { code: "INTERBANK_TRANSFER_FAILED", message: error.message } });
  }
};

module.exports = {
  transfer
};
