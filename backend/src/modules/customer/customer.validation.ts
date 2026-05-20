const { z } = require("zod");

const createCustomerSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  cnic: z.string().regex(/^\d{13,15}$/, "CNIC must be 13-15 digits"),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
});

const updateCustomerSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const customerIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

module.exports = { createCustomerSchema, updateCustomerSchema, customerIdParamSchema };
