import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const auditService = require("../audit/audit.service");

const getAllEmployees = async () => {
  return await prisma.employee.findMany({
    include: {
      branch: {
        select: { branch_id: true, branch_name: true, city: true },
      },
    },
    orderBy: { employee_id: "asc" },
  });
};

const getEmployeeById = async (employeeId: number) => {
  const employee = await prisma.employee.findUnique({
    where: { employee_id: employeeId },
    include: {
      branch: {
        select: { branch_id: true, branch_name: true, city: true },
      },
    },
  });
  if (!employee) throw new Error("Employee not found");
  const { password_hash, totp_secret, ...safe } = employee;
  return safe;
};

const createEmployee = async (
  data: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    branch_id: number;
    password: string;
    hire_date?: string;
  },
  actorEmployeeId: number,
  ipAddress?: string
) => {
  const existing = await prisma.employee.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("An employee with this email already exists");

  const password_hash = await bcrypt.hash(data.password, 12);
  const employee = await prisma.employee.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      role: data.role,
      branch_id: data.branch_id,
      password_hash,
      hire_date: data.hire_date ? new Date(data.hire_date) : new Date(),
      is_active: true,
    },
    include: {
      branch: { select: { branch_id: true, branch_name: true, city: true } },
    },
  });

  await auditService.log({
    employeeId: actorEmployeeId,
    entityType: "employee",
    entityId: employee.employee_id,
    action: "EMPLOYEE_CREATED",
    newValue: {
      employee_id: employee.employee_id,
      email: employee.email,
      role: employee.role,
      branch_id: employee.branch_id,
    },
    ipAddress,
  });

  const { password_hash: _, totp_secret: __, ...safe } = employee;
  return safe;
};

const updateEmployee = async (
  employeeId: number,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    branch_id?: number;
    is_active?: boolean;
  },
  actorEmployeeId: number,
  ipAddress?: string
) => {
  const existing = await prisma.employee.findUnique({
    where: { employee_id: employeeId },
  });
  if (!existing) throw new Error("Employee not found");

  // If email is being changed, ensure no duplicate
  if (data.email && data.email !== existing.email) {
    const conflict = await prisma.employee.findUnique({ where: { email: data.email } });
    if (conflict) throw new Error("An employee with this email already exists");
  }

  const { password_hash: oldPw, totp_secret: oldTotp, ...oldValue } = existing;

  const updated = await prisma.employee.update({
    where: { employee_id: employeeId },
    data,
    include: {
      branch: { select: { branch_id: true, branch_name: true, city: true } },
    },
  });

  await auditService.log({
    employeeId: actorEmployeeId,
    entityType: "employee",
    entityId: employeeId,
    action: "EMPLOYEE_UPDATED",
    oldValue,
    newValue: data,
    ipAddress,
  });

  const { password_hash: _, totp_secret: __, ...safe } = updated;
  return safe;
};

const deleteEmployee = async (
  employeeId: number,
  actorEmployeeId: number,
  ipAddress?: string
) => {
  const existing = await prisma.employee.findUnique({
    where: { employee_id: employeeId },
  });
  if (!existing) throw new Error("Employee not found");
  if (employeeId === actorEmployeeId) throw new Error("You cannot delete your own account");

  await prisma.employee.delete({ where: { employee_id: employeeId } });

  await auditService.log({
    employeeId: actorEmployeeId,
    entityType: "employee",
    entityId: employeeId,
    action: "EMPLOYEE_DELETED",
    oldValue: { email: existing.email, role: existing.role },
    ipAddress,
  });

  return { message: "Employee deleted successfully" };
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
