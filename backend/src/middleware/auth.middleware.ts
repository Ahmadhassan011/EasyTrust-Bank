import type { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "easytrust-secret";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "customer" | "employee";
  };
}

const authRequired = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authorization token required" }
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" }
    });
  }
};

const roleRequired = (allowedRoles: ("customer" | "employee")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Access denied. Insufficient permissions." }
      });
    }

    next();
  };
};

module.exports = {
  authRequired,
  roleRequired
};
