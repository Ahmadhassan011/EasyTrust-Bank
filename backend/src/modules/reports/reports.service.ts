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

  const by_type: Record<string, { count: number; total: number }> = {};
  const by_status: Record<string, { count: number; total: number }> = {};
  let total_amount = 0;

  summary.forEach((item: any) => {
    const amt = Number(item._sum.amount || 0);
    const cnt = item._count.transaction_id;
    total_amount += amt;

    if (!by_type[item.type]) by_type[item.type] = { count: 0, total: 0 };
    by_type[item.type].count += cnt;
    by_type[item.type].total += amt;

    if (!by_status[item.status]) by_status[item.status] = { count: 0, total: 0 };
    by_status[item.status].count += cnt;
    by_status[item.status].total += amt;
  });

  return {
    month: `${targetYear}-${targetMonth.toString().padStart(2, "0")}`,
    total_transactions: transactions.length,
    total_amount,
    by_type,
    by_status,
  };
};

module.exports = { getMonthlyTransactions };
