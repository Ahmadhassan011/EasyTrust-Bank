const { z } = require("zod");

const createEmployeeSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"]),
  branch_id: z.number().int().positive("Branch ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  hire_date: z.string().optional() // Optional, defaults to today
});

const updateEmployeeSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters").optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.enum(["TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"]).optional(),
  branch_id: z.number().int().positive("Branch ID is required").optional(),
  is_active: z.boolean().optional(),
});

const employeeIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Valid employee ID required"),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParamSchema,
};
