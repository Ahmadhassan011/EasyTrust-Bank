import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production";
};

const generateAccessToken = (payload: { userId: number; role: string; type: string }) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (payload: { userId: number; role: string; type: string }) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const verifyToken = (token: string) => {
  return jwt.verify(token, getJwtSecret()) as { userId: number; role: string; type: string; iat: number; exp: number };
};

const registerCustomer = async (data: {
  first_name: string;
  last_name: string;
  cnic: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  dob?: string;
}) => {
  const password_hash = await bcrypt.hash(data.password, 12);

  const customer = await prisma.customer.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      cnic: data.cnic,
      email: data.email,
      password_hash,
      phone: data.phone ?? null,
      address: data.address ?? null,
      dob: data.dob ? new Date(data.dob) : null,
    },
  });

  const accessToken = generateAccessToken({ userId: customer.customer_id, role: "CUSTOMER", type: "customer" });
  const refreshToken = generateRefreshToken({ userId: customer.customer_id, role: "CUSTOMER", type: "customer" });

  const { password_hash: _, ...safeCustomer } = customer;
  return { customer: safeCustomer, accessToken, refreshToken };
};

const login = async (identifier: string, password: string) => {
  const customer = await prisma.customer.findFirst({
    where: { OR: [{ cnic: identifier }, { email: identifier }] },
  });

  if (customer) {
    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken({ userId: customer.customer_id, role: "CUSTOMER", type: "customer" });
    const refreshToken = generateRefreshToken({ userId: customer.customer_id, role: "CUSTOMER", type: "customer" });

    const { password_hash: _, ...safeCustomer } = customer;
    return { user: safeCustomer, role: "CUSTOMER", accessToken, refreshToken };
  }

  const employee = await prisma.employee.findFirst({
    where: { email: identifier },
  });

  if (employee) {
    if (!employee.is_active) throw new Error("Employee account is inactive");
    if (!employee.password_hash) throw new Error("No password set for this employee");
    const valid = await bcrypt.compare(password, employee.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken({ userId: employee.employee_id, role: employee.role, type: "employee" });
    const refreshToken = generateRefreshToken({ userId: employee.employee_id, role: employee.role, type: "employee" });

    const { password_hash: _, ...safeEmployee } = employee;
    return { user: safeEmployee, role: employee.role, accessToken, refreshToken };
  }

  throw new Error("User not found");
};

const refreshAccessToken = (refreshToken: string) => {
  const decoded = verifyToken(refreshToken);
  const accessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role, type: decoded.type });
  return { accessToken };
};

module.exports = { registerCustomer, login, refreshAccessToken, verifyToken };
