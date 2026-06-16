import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");

// Customer submits a cheque deposit request — NO money credited yet
const createChequeRequest = async (data: {
  account_id: number;
  amount: number;
  cheque_number: string;
  bank_name: string;
  front_photo_url?: string;
  back_photo_url?: string;
}) => {
  const account = await prisma.account.findUnique({ where: { account_id: data.account_id } });
  if (!account) throw new Error("Account not found");
  if (account.status !== "ACTIVE") throw new Error("Account is not active");
  if (data.amount <= 0) throw new Error("Amount must be greater than zero");

  return await prisma.chequeDepositRequest.create({
    data: {
      account_id: data.account_id,
      amount: data.amount,
      cheque_number: data.cheque_number,
      bank_name: data.bank_name,
      front_photo_url: data.front_photo_url ?? null,
      back_photo_url: data.back_photo_url ?? null,
      status: "PENDING",
    },
    include: {
      account: { include: { customer: { select: { first_name: true, last_name: true, email: true } } } },
    },
  });
};

// Manager / Teller approves — money is credited now
const approveChequeRequest = async (requestId: number, employeeId: number) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const request = await tx.chequeDepositRequest.findUnique({ where: { request_id: requestId } });
    if (!request) throw new Error("Cheque deposit request not found");
    if (request.status !== "PENDING") throw new Error(`Request is already ${request.status}`);

    const account = await tx.account.findUnique({ where: { account_id: request.account_id } });
    if (!account || account.status !== "ACTIVE") throw new Error("Account is not active");

    // Credit funds to customer account
    await tx.account.update({
      where: { account_id: request.account_id },
      data: { balance: { increment: request.amount } },
    });

    // Create completed transaction record
    const transaction = await tx.transaction.create({
      data: {
        to_account_id: request.account_id,
        amount: request.amount,
        type: "CHEQUE_DEPOSIT",
        status: "COMPLETED",
        description: `Cheque deposit approved — Cheque #${request.cheque_number} (${request.bank_name})`,
      },
    });

    // Mark request as approved and link transaction
    return await tx.chequeDepositRequest.update({
      where: { request_id: requestId },
      data: {
        status: "APPROVED",
        reviewed_by: employeeId,
        reviewed_at: new Date(),
        transaction_id: transaction.transaction_id,
      },
      include: {
        account: { include: { customer: { select: { first_name: true, last_name: true, email: true } } } },
        transaction: true,
        reviewer: { select: { first_name: true, last_name: true, role: true } },
      },
    });
  });
};

// Manager / Teller rejects — no money moved
const rejectChequeRequest = async (requestId: number, employeeId: number, reason?: string) => {
  const request = await prisma.chequeDepositRequest.findUnique({ where: { request_id: requestId } });
  if (!request) throw new Error("Cheque deposit request not found");
  if (request.status !== "PENDING") throw new Error(`Request is already ${request.status}`);

  return await prisma.chequeDepositRequest.update({
    where: { request_id: requestId },
    data: {
      status: "REJECTED",
      reviewed_by: employeeId,
      reviewed_at: new Date(),
      rejection_reason: reason ?? "Rejected by reviewer",
    },
    include: {
      reviewer: { select: { first_name: true, last_name: true, role: true } },
    },
  });
};

// Get all requests (for manager/teller dashboard)
const getAllRequests = async (statusFilter?: string) => {
  return await prisma.chequeDepositRequest.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      account: {
        include: {
          customer: { select: { first_name: true, last_name: true, email: true, cnic: true } },
        },
      },
      reviewer: { select: { first_name: true, last_name: true, role: true } },
    },
    orderBy: { requested_at: "desc" },
  });
};

// Get requests for a specific customer (by account ownership)
const getRequestsByCustomer = async (customerId: number) => {
  return await prisma.chequeDepositRequest.findMany({
    where: { account: { customer_id: customerId } },
    include: {
      account: true,
      reviewer: { select: { first_name: true, last_name: true } },
    },
    orderBy: { requested_at: "desc" },
  });
};

const getRequestById = async (requestId: number) => {
  return await prisma.chequeDepositRequest.findUnique({
    where: { request_id: requestId },
    include: {
      account: { include: { customer: true } },
      transaction: true,
      reviewer: { select: { first_name: true, last_name: true, role: true } },
    },
  });
};

module.exports = {
  createChequeRequest,
  approveChequeRequest,
  rejectChequeRequest,
  getAllRequests,
  getRequestsByCustomer,
  getRequestById,
};
