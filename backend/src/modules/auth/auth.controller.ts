import type { Request, Response } from "express";
const authService = require("./auth.service");
const auditService = require("../audit/audit.service");

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

const loginWithMfa = async (req: Request, res: Response) => {
  try {
    const { mfaToken, totpCode } = req.body;
    if (!mfaToken || !totpCode) {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "mfaToken and totpCode required" } });
    }
    const result = await authService.loginWithMfa(mfaToken, totpCode);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { code: "MFA_FAILED", message: error.message } });
  }
};

const setupMfa = async (req: Request, res: Response) => {
  try {
    const result = await authService.setupMfa(req.user!.userId);
    await auditService.log({
      employeeId: req.user!.userId,
      entityType: "employee",
      entityId: req.user!.userId,
      action: "MFA_SETUP",
      newValue: { secret: result.secret },
      ipAddress: req.ip,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "MFA_SETUP_FAILED", message: error.message } });
  }
};

const enableMfa = async (req: Request, res: Response) => {
  try {
    const { secret, totpCode } = req.body;
    const result = await authService.enableMfa(req.user!.userId, secret, totpCode);
    await auditService.log({
      employeeId: req.user!.userId,
      entityType: "employee",
      entityId: req.user!.userId,
      action: "MFA_ENABLE",
      ipAddress: req.ip,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "MFA_ENABLE_FAILED", message: error.message } });
  }
};

const disableMfa = async (req: Request, res: Response) => {
  try {
    const { totpCode } = req.body;
    const result = await authService.disableMfa(req.user!.userId, totpCode);
    await auditService.log({
      employeeId: req.user!.userId,
      entityType: "employee",
      entityId: req.user!.userId,
      action: "MFA_DISABLE",
      ipAddress: req.ip,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: "MFA_DISABLE_FAILED", message: error.message } });
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

module.exports = { register, login, loginWithMfa, setupMfa, enableMfa, disableMfa, refresh };
