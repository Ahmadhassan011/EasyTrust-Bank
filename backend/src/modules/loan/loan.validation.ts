const { z } = require("zod");

const applyLoanSchema = z.object({
  customer_id: z.number().int().positive("Customer ID must be a positive integer"),
  branch_id: z.number().int().positive("Branch ID must be a positive integer"),
  principal_amount: z.number().positive("Principal amount must be a positive number"),
  interest_rate: z.number().positive("Interest rate must be a positive number"), // Annual rate, e.g. 8.5
  tenure_months: z.number().int().positive("Tenure months must be a positive integer"),
  loan_type: z.enum(["PERSONAL", "HOME", "AUTO", "BUSINESS"])
});

const approveLoanSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"])
});

const repayLoanSchema = z.object({
  account_id: z.number().int().positive("Deduction Account ID must be a positive integer"),
  amount: z.number().positive("Repayment amount must be a positive number")
});

module.exports = {
  applyLoanSchema,
  approveLoanSchema,
  repayLoanSchema
};
