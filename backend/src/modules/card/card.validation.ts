const { z } = require("zod");

const createCardSchema = z.object({
  account_id: z.number().int().positive(),
  card_type: z.enum(["DEBIT", "CREDIT"]),
  daily_limit: z.number().positive().optional(),
  pin: z.string().regex(/^\d{4}$/, "PIN must be a 4-digit number"),
});

const updateCardStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED", "CLOSED"]),
});

const updateCardLimitSchema = z.object({
  daily_limit: z.number().positive(),
});

const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN must be a 4-digit number"),
});

const changePinSchema = z.object({
  old_pin: z.string().regex(/^\d{4}$/, "PIN must be a 4-digit number"),
  new_pin: z.string().regex(/^\d{4}$/, "PIN must be a 4-digit number"),
});

const cardIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const accountIdParamSchema = z.object({
  accountId: z.coerce.number().int().positive(),
});

module.exports = {
  createCardSchema,
  updateCardStatusSchema,
  updateCardLimitSchema,
  verifyPinSchema,
  changePinSchema,
  cardIdParamSchema,
  accountIdParamSchema,
};

