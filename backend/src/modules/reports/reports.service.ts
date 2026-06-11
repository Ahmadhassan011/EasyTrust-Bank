const prisma = require("../../config/prisma");

const getMonthlyTransactions = async (month?: number, year?: number) => {
  const targetMonth = month ?? new Date().getMonth() + 1;
  const targetYear = year ?? new Date().getFullYear();

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      created_at: { gte: startDate, lt: endDate },
    },
    orderBy: { created_at: "desc" },
    include: {
      fromAccount: {
        select: { account_number: true, account_id: true },
      },
      toAccount: {
        select: { account_number: true, account_id: true },
      },
    },
  });

  const summary = await prisma.transaction.groupBy({
    by: ["type", "status"],
    where: {
      created_at: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
    _count: { transaction_id: true },
  });

  return {
    month: targetMonth,
    year: targetYear,
    totalTransactions: transactions.length,
    summary,
    transactions,
  };
};

module.exports = { getMonthlyTransactions };
