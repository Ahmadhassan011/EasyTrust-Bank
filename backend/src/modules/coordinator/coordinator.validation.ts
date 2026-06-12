const { z } = require("zod");

const twoPhaseCommitSchema = z.object({
  sender_account_id: z.number().int().positive(),
  receiver_bank_swift: z.string().min(8).max(11),
  receiver_account_number: z.string().min(1),
  amount: z.number().positive(),
  raast_network_id: z.number().int().positive(),
  description: z.string().optional(),
});

module.exports = { twoPhaseCommitSchema };
