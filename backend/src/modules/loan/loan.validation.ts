const { z } = require("zod");

const applyLoanSchema = z.object({
  customer_id: z.number().positive(),
  branch_id: z.number().positive(),
  principal_amount: z.number().positive(),
  interest_rate: z.number().min(0).max(100),
  tenure_months: z.number().int().positive(),
  loan_type: z.enum(["PERSONAL", "HOME", "AUTO", "EDUCATION"]),
});

const approveLoanSchema = z.object({
  employeeId: z.number().positive(),
});

const repayLoanSchema = z.object({
  fromAccountId: z.number().positive(),
  amount: z.number().positive(),
});

const loanIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

module.exports = { applyLoanSchema, approveLoanSchema, repayLoanSchema, loanIdParamSchema };
