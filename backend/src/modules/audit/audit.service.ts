import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");

interface LogParams {
  employeeId?: number | null;
  entityType: string;
  entityId: number;
  action: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
}

const log = async (params: LogParams) => {
  return await prisma.auditLog.create({
    data: {
      employee_id: params.employeeId ?? null,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
      ip_address: params.ipAddress ?? null,
    },
  });
};

const getLogs = async (filters: {
  entityType?: string;
  entityId?: number;
  action?: string;
  employeeId?: number;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}) => {
  const where: any = {};

  if (filters.entityType) where.entity_type = filters.entityType;
  if (filters.entityId) where.entity_id = filters.entityId;
  if (filters.action) where.action = filters.action;
  if (filters.employeeId) where.employee_id = filters.employeeId;
  if (filters.fromDate || filters.toDate) {
    where.logged_at = {};
    if (filters.fromDate) where.logged_at.gte = new Date(filters.fromDate);
    if (filters.toDate) where.logged_at.lte = new Date(filters.toDate);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { logged_at: "desc" },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        employee: {
          select: { employee_id: true, first_name: true, last_name: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, limit: filters.limit || 50, offset: filters.offset || 0 };
};

module.exports = { log, getLogs };
