import type { Request, Response, NextFunction } from "express";
const { ZodError } = require("zod");

const validate = (schema: any, source: "body" | "params" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid request data", details },
        });
      }
      next(error);
    }
  };
};

module.exports = { validate };
