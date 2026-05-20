const { z } = require("zod");

const createAccountSchema = z.object({
  customer_id: z.number().positive(),
  branch_id: z.number().positive(),
  account_type: z.enum(["SAVINGS", "CHECKING", "FIXED_DEPOSIT"]),
  balance: z.number().min(0).default(0),
  currency: z.string().length(3).default("PKR"),
});

const updateAccountStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "DORMANT", "CLOSED"]),
});

const accountIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

const customerIdParamSchema = z.object({
  customerId: z.coerce.number().positive(),
});

module.exports = { createAccountSchema, updateAccountStatusSchema, accountIdParamSchema, customerIdParamSchema };
