import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: result.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        }
      });
    }
    // Assign parsed data to body
    req.body = result.data;
    next();
  };
};

module.exports = {
  validate
};
