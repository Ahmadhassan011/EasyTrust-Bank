import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");

const idempotencyStore = new Map<string, { result: any; expiresAt: number }>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

const checkIdempotency = (key: string) => {
  const entry = idempotencyStore.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.result;
  return null;
};

const setIdempotency = (key: string, result: any) => {
  idempotencyStore.set(key, { result, expiresAt: Date.now() + IDEMPOTENCY_TTL });
};

const executeTransfer = async (
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  description?: string,
  idempotencyKey?: string
) => {
  if (idempotencyKey) {
    const existing = checkIdempotency(idempotencyKey);
    if (existing) return existing;
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT balance FROM account WHERE account_id = ${fromAccountId} FOR UPDATE`;
    await tx.$executeRaw`SELECT balance FROM account WHERE account_id = ${toAccountId} FOR UPDATE`;

    const sender = await tx.account.findUnique({ where: { account_id: fromAccountId } });
    if (!sender || sender.balance.toNumber() < amount) {
      throw new Error("Insufficient funds");
    }

    await tx.account.update({
      where: { account_id: fromAccountId },
      data: { balance: { decrement: amount } }
    });

    await tx.account.update({
      where: { account_id: toAccountId },
      data: { balance: { increment: amount } }
    });

    return await tx.transaction.create({
      data: {
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: description ?? null
      }
    });
  });

  if (idempotencyKey) setIdempotency(idempotencyKey, result);
  return result;
};

const executeDeposit = async (toAccountId: number, amount: number, description?: string, idempotencyKey?: string) => {
  if (idempotencyKey) {
    const existing = checkIdempotency(idempotencyKey);
    if (existing) return existing;
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT balance FROM account WHERE account_id = ${toAccountId} FOR UPDATE`;

    await tx.account.update({
      where: { account_id: toAccountId },
      data: { balance: { increment: amount } }
    });

    return await tx.transaction.create({
      data: {
        to_account_id: toAccountId,
        amount,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        description: description ?? null
      }
    });
  });

  if (idempotencyKey) setIdempotency(idempotencyKey, result);
  return result;
};

const executeWithdrawal = async (fromAccountId: number, amount: number, description?: string, idempotencyKey?: string) => {
  if (idempotencyKey) {
    const existing = checkIdempotency(idempotencyKey);
    if (existing) return existing;
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT balance FROM account WHERE account_id = ${fromAccountId} FOR UPDATE`;

    const sender = await tx.account.findUnique({ where: { account_id: fromAccountId } });
    if (!sender || sender.balance.toNumber() < amount) {
      throw new Error("Insufficient funds");
    }

    await tx.account.update({
      where: { account_id: fromAccountId },
      data: { balance: { decrement: amount } }
    });

    return await tx.transaction.create({
      data: {
        from_account_id: fromAccountId,
        amount,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        description: description ?? null
      }
    });
  });

  if (idempotencyKey) setIdempotency(idempotencyKey, result);
  return result;
};

const getTransactionHistory = async (
  accountId: number,
  options?: { limit?: number; offset?: number; fromDate?: string; toDate?: string }
) => {
  const where: any = {
    OR: [
      { from_account_id: accountId },
      { to_account_id: accountId }
    ]
  };

  if (options?.fromDate || options?.toDate) {
    where.created_at = {};
    if (options?.fromDate) where.created_at.gte = new Date(options.fromDate);
    if (options?.toDate) where.created_at.lte = new Date(options.toDate);
  }

  return await prisma.transaction.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0
  });
};

module.exports = {
  executeTransfer,
  executeDeposit,
  executeWithdrawal,
  getTransactionHistory
};
