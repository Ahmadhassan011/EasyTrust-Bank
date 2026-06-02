const { z } = require("zod");

const depositWithdrawSchema = z.object({
  amount: z.number().positive("Amount must be a positive number")
});

const transferSchema = z.object({
  to_account_number: z.string().min(1, "Recipient account number is required"),
  amount: z.number().positive("Amount must be a positive number"),
  description: z.string().optional()
});

module.exports = {
  depositWithdrawSchema,
  transferSchema
};
