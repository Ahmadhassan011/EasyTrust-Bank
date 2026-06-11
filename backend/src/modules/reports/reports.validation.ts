const { z } = require("zod");

const monthlyTransactionsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

module.exports = { monthlyTransactionsQuerySchema };
