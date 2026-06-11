const { z } = require("zod");

const transferSchema = z.object({
  fromAccountId: z.number().positive(),
  amount: z.number().positive(),
  raastNetworkId: z.number().positive(),
  senderBankSwift: z.string().trim().length(11),
  receiverBankSwift: z.string().trim().length(11),
  raastReference: z.string().trim().max(255).optional(),
});

const interbankIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

module.exports = { transferSchema, interbankIdParamSchema };