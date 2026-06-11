import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");

const calculateEMI = (principal: number, annualRate: number, tenureMonths: number) => {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const applyForLoan = async (data: any) => {
  const { principal_amount, interest_rate, tenure_months } = data;
  const emi = calculateEMI(Number(principal_amount), Number(interest_rate), Number(tenure_months));

  return await prisma.loan.create({
    data: {
      ...data,
      status: 'PENDING'
    }
  });
};

const approveLoan = async (loanId: number, employeeId: number) => {
  return await prisma.loan.update({
    where: { loan_id: loanId },
    data: {
      status: 'APPROVED',
      approved_by: employeeId,
      disbursement_date: new Date()
    }
  });
};

const rejectLoan = async (loanId: number, employeeId: number, reason?: string) => {
  return await prisma.loan.update({
    where: { loan_id: loanId },
    data: {
      status: 'REJECTED',
      approved_by: employeeId,
      rejection_reason: reason ?? null
    }
  });
};

const makeRepayment = async (loanId: number, fromAccountId: number, amount: number) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const loan = await tx.loan.findUnique({ where: { loan_id: loanId } });
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== 'APPROVED') throw new Error("Loan is not active");

    const monthlyRate = loan.interest_rate.toNumber() / 12 / 100;

    const lastRepayment = await tx.loanRepayment.findFirst({
      where: { loan_id: loanId },
      orderBy: { repayment_id: 'desc' }
    });
    const outstandingBalance = lastRepayment
      ? lastRepayment.remaining_balance.toNumber()
      : loan.principal_amount.toNumber();

    const interestComponent = outstandingBalance * monthlyRate;
    const principalComponent = amount - interestComponent;

    await tx.$executeRaw`SELECT balance FROM account WHERE account_id = ${fromAccountId} FOR UPDATE`;
    const sender = await tx.account.findUnique({ where: { account_id: fromAccountId } });
    if (!sender || sender.balance.toNumber() < amount) {
      throw new Error("Insufficient funds");
    }

    await tx.account.update({
      where: { account_id: fromAccountId },
      data: { balance: { decrement: amount } }
    });

    const transaction = await tx.transaction.create({
      data: {
        from_account_id: fromAccountId,
        amount,
        type: 'LOAN_REPAYMENT',
        status: 'COMPLETED',
        description: `Loan repayment for loan #${loanId}`
      }
    });

    const remainingBalance = outstandingBalance - principalComponent;

    return await tx.loanRepayment.create({
      data: {
        loan_id: loanId,
        transaction_id: transaction.transaction_id,
        amount_paid: amount,
        principal_component: principalComponent < 0 ? 0 : principalComponent,
        interest_component: interestComponent,
        remaining_balance: remainingBalance < 0 ? 0 : remainingBalance,
        due_date: new Date(),
        paid_date: new Date(),
        status: 'PAID'
      }
    });
  });
};

const getLoansByCustomer = async (customerId: number) => {
  return await prisma.loan.findMany({
    where: { customer_id: customerId },
    include: { repayments: true }
  });
};

const getLoanById = async (loanId: number) => {
  return await prisma.loan.findUnique({
    where: { loan_id: loanId }
  });
};

module.exports = {
  calculateEMI,
  applyForLoan,
  approveLoan,
  rejectLoan,
  makeRepayment,
  getLoansByCustomer,
  getLoanById
};
