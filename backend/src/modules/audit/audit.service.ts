const prisma = require("../../config/prisma");

const logAuditEvent = async (
  employeeId: number | null,
  entityType: string,
  entityId: number,
  action: string,
  oldValue: string | null,
  newValue: string | null,
  ipAddress?: string
) => {
  try {
    return await prisma.auditLog.create({
      data: {
        employee_id: employeeId,
        entity_type: entityType,
        entity_id: entityId,
        action,
        old_value: oldValue,
        new_value: newValue,
        ip_address: ipAddress || "127.0.0.1"
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};

const getAuditLogs = async () => {
  return await prisma.auditLog.findMany({
    orderBy: { logged_at: "desc" },
    include: {
      employee: {
        select: {
          employee_id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true
        }
      }
    }
  });
};

module.exports = {
  logAuditEvent,
  getAuditLogs
};
