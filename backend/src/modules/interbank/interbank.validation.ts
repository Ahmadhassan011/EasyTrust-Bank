const { z } = require("zod");

const interbankTransferSchema = z.object({
  sender_account_id: z.number().int().positive("Sender Account ID must be a positive integer"),
  receiver_bank_swift: z.string().length(11, "Receiver bank SWIFT code must be exactly 11 characters"),
  receiver_account_number: z.string().min(1, "Receiver account number is required"),
  amount: z.number().positive("Transfer amount must be a positive number"),
  raast_network_id: z.number().int().positive("Raast Network ID must be a positive integer"),
  description: z.string().optional()
});

module.exports = {
  interbankTransferSchema
};
