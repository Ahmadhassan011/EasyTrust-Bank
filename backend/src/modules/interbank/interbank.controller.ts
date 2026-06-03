import type { Request, Response } from "express";
const interbankService = require("./interbank.service");

const transfer = async (req: Request, res: Response) => {
  try {
    const result = await interbankService.createTransfer(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: "INTERBANK_TRANSFER_FAILED", message: error.message },
    });
  }
};

module.exports = { transfer };