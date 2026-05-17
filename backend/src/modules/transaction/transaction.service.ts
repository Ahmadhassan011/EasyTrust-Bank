const prisma = require("../../config/prisma");

/**
 * Handles basic transaction logic.
 * Note: For 2PC/Distributed transactions, this will be expanded later
 * to integrate with a Coordinator service.
 */
const executeTransfer = async (fromAccountId: number, toAccountId: number, amount: number, description?: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify balances
    const sender = await tx.account.findUnique({ where: { account_id: fromAccountId } });
    if (!sender || sender.balance.toNumber() < amount) {
      throw new Error("Insufficient funds");
    }

    // 2. Debit
    await tx.account.update({
      where: { account_id: fromAccountId },
      data: { balance: { decrement: amount } }
    });

    // 3. Credit
    await tx.account.update({
      where: { account_id: toAccountId },
      data: { balance: { increment: amount } }
    });

    // 4. Record Transaction
    return await tx.transaction.create({
      data: {
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description
      }
    });
  });
};

const getTransactionHistory = async (accountId: number) => {
  return await prisma.transaction.findMany({
    where: {
      OR: [
        { from_account_id: accountId },
        { to_account_id: accountId }
      ]
    },
    orderBy: { created_at: 'desc' }
  });
};

module.exports = {
  executeTransfer,
  getTransactionHistory
};
