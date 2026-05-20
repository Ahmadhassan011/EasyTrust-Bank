import type { Response } from "express";

const success = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const error = (res: Response, message: string, code = "INTERNAL_ERROR", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, error: { code, message } });
};

module.exports = { success, error };
