import type { Request, Response, NextFunction } from "express";
const authService = require("../modules/auth/auth.service");

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string; type: string };
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid token" } });
  }

  const token = header.slice(7);
  try {
    const decoded = authService.verifyToken(token);
    req.user = { userId: decoded.userId, role: decoded.role, type: decoded.type };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: "TOKEN_EXPIRED", message: "Token expired or invalid" } });
  }
};

const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: `Role '${req.user.role}' not permitted` } });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
