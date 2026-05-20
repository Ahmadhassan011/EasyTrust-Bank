const { z } = require("zod");

const transferSchema = z.object({
  fromAccountId: z.number().positive(),
  toAccountId: z.number().positive(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const depositSchema = z.object({
  toAccountId: z.number().positive(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const withdrawSchema = z.object({
  fromAccountId: z.number().positive(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

module.exports = { transferSchema, depositSchema, withdrawSchema, historyQuerySchema };
