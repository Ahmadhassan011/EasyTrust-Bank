const { z } = require("zod");

const registerSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  cnic: z.string().regex(/^\d{13,15}$/, "CNIC must be 13-15 digits"),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const mfaLoginSchema = z.object({
  mfaToken: z.string().min(1),
  totpCode: z.string().min(1),
});

const mfaSetupSchema = z.object({});

const mfaEnableSchema = z.object({
  secret: z.string().min(1),
  totpCode: z.string().min(1),
});

const mfaDisableSchema = z.object({
  totpCode: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

module.exports = { registerSchema, loginSchema, mfaLoginSchema, mfaSetupSchema, mfaEnableSchema, mfaDisableSchema, refreshSchema };
