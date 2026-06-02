const { z } = require("zod");

const registerSchema = z.object({
  role: z.enum(["customer", "employee"]),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  
  // Customer specific
  cnic: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(), // YYYY-MM-DD
  
  // Employee specific
  branch_id: z.number().optional(),
  employee_role: z.string().optional(), // role in employee table (e.g., TELLER, MANAGER)
  hire_date: z.string().optional() // YYYY-MM-DD
}).refine((data: any) => {
  if (data.role === "customer") {
    return !!data.cnic;
  } else {
    return !!data.branch_id && !!data.employee_role && !!data.hire_date;
  }
}, {
  message: "Missing required fields for customer or employee role",
  path: ["role"]
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const mfaVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "MFA code must be exactly 6 digits")
});

module.exports = {
  registerSchema,
  loginSchema,
  mfaVerifySchema
};
