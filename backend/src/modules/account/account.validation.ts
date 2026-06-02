const { z } = require("zod");

const createAccountSchema = z.object({
  customer_id: z.number().int().positive("Customer ID must be a positive integer"),
  branch_id: z.number().int().positive("Branch ID must be a positive integer"),
  account_type: z.enum(["SAVINGS", "CHECKING", "FIXED_DEPOSIT"]),
  currency: z.string().length(3).default("PKR")
});

const issueCardSchema = z.object({
  account_id: z.number().int().positive("Account ID must be a positive integer"),
  card_type: z.enum(["DEBIT", "CREDIT"]),
  daily_limit: z.number().positive().default(50000.00)
});

module.exports = {
  createAccountSchema,
  issueCardSchema
};
