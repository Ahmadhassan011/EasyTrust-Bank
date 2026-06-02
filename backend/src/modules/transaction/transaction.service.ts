const prisma = require("../../config/prisma");

const deposit = async (accountId: number, amount: number) => {
  return await prisma.$transaction(async (tx: any) => {
    const account = await tx.account.findUnique({
      where: { account_id: accountId }
    });

    if (!account) throw new Error("Account not found");
    if (account.status !== "ACTIVE") throw new Error("Account is not active");

    const updatedAccount = await tx.account.update({
      where: { account_id: accountId },
      data: { balance: { increment: amount } }
    });

    const transaction = await tx.transaction.create({
      data: {
        to_account_id: accountId,
        amount,
        type: "DEPOSIT",
        status: "COMPLETED",
        description: `Deposit of ${amount} ${account.currency}`
      }
    });

    return { transaction, new_balance: updatedAccount.balance };
  });
};

const withdraw = async (accountId: number, amount: number) => {
  return await prisma.$transaction(async (tx: any) => {
    const account = await tx.account.findUnique({
      where: { account_id: accountId }
    });

    if (!account) throw new Error("Account not found");
    if (account.status !== "ACTIVE") throw new Error("Account is not active");

    // Check balance
    if (Number(account.balance) < amount) {
      throw new Error("Insufficient funds");
    }

    const updatedAccount = await tx.account.update({
      where: { account_id: accountId },
      data: { balance: { decrement: amount } }
    });

    const transaction = await tx.transaction.create({
      data: {
        from_account_id: accountId,
        amount,
        type: "WITHDRAWAL",
        status: "COMPLETED",
        description: `Withdrawal of ${amount} ${account.currency}`
      }
    });

    return { transaction, new_balance: updatedAccount.balance };
  });
};

const transfer = async (fromAccountId: number, toAccountNumber: string, amount: number, description?: string) => {
  return await prisma.$transaction(async (tx: any) => {
    const sender = await tx.account.findUnique({
      where: { account_id: fromAccountId }
    });

    if (!sender) throw new Error("Sender account not found");
    if (sender.status !== "ACTIVE") throw new Error("Sender account is not active");
    if (Number(sender.balance) < amount) throw new Error("Insufficient funds");

    const recipient = await tx.account.findUnique({
      where: { account_number: toAccountNumber }
    });

    if (!recipient) throw new Error("Recipient account not found");
    if (recipient.status !== "ACTIVE") throw new Error("Recipient account is not active");
    if (sender.account_id === recipient.account_id) throw new Error("Cannot transfer to the same account");

    // Ensure currency consistency (in real banks or simple conversions, but here we assume direct transfer)
    if (sender.currency !== recipient.currency) {
      throw new Error("Currency mismatch between accounts");
    }

    // Deduct from sender
    await tx.account.update({
      where: { account_id: sender.account_id },
      data: { balance: { decrement: amount } }
    });

    // Credit to recipient
    await tx.account.update({
      where: { account_id: recipient.account_id },
      data: { balance: { increment: amount } }
    });

    const transaction = await tx.transaction.create({
      data: {
        from_account_id: sender.account_id,
        to_account_id: recipient.account_id,
        amount,
        type: "TRANSFER",
        status: "COMPLETED",
        description: description || `Transfer of ${amount} from ${sender.account_number} to ${recipient.account_number}`
      }
    });

    return transaction;
  });
};

const getTransactionHistory = async (userId: number, role: "customer" | "employee") => {
  if (role === "employee") {
    // Employees can inspect all transactions
    return await prisma.transaction.findMany({
      orderBy: { created_at: "desc" },
      include: {
        fromAccount: true,
        toAccount: true
      }
    });
  } else {
    // Customers can only see their own transactions
    return await prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccount: { customer_id: userId } },
          { toAccount: { customer_id: userId } }
        ]
      },
      orderBy: { created_at: "desc" },
      include: {
        fromAccount: true,
        toAccount: true
      }
    });
  }
};

module.exports = {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory
};
