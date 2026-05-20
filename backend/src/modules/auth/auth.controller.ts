import type { Request, Response } from "express";
const authService = require("./auth.service");

const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerCustomer(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "REGISTRATION_FAILED", message: error.message } });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "identifier and password required" } });
    }
    const result = await authService.login(identifier, password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { code: "AUTH_FAILED", message: error.message } });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: { code: "MISSING_TOKEN", message: "refreshToken required" } });
    }
    const result = authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid or expired refresh token" } });
  }
};

module.exports = { register, login, refresh };
