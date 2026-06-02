const { z } = require("zod");

const auditQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.coerce.number().optional(),
  action: z.string().optional(),
  employeeId: z.coerce.number().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
  offset: z.coerce.number().min(0).optional(),
});

module.exports = { auditQuerySchema };
