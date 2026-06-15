import type { Prisma } from "@prisma/client";
const prisma = require("../../config/prisma");

// ────────────────────────────────────────────────────────────
// EMI formula  (reducing-balance / flat-rate monthly)
// ────────────────────────────────────────────────────────────
const calculateEMI = (principal: number, annualRate: number, tenureMonths: number) => {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  if (r === 0) return principal / n;           // 0 % rate edge-case
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// ────────────────────────────────────────────────────────────
// Fix 3: Apply — validate KYC + active account
// ────────────────────────────────────────────────────────────
const applyForLoan = async (data: any) => {
  // 1. Customer must have VERIFIED KYC
  const customer = await prisma.customer.findUnique({
    where: { customer_id: data.customer_id },
  });
  if (!customer) throw new Error("Customer not found");
  if (customer.kyc_status !== "VERIFIED") {
    throw new Error("KYC must be VERIFIED before applying for a loan");
  }

  // 2. Customer must have at least one ACTIVE account for disbursement
  const activeAccount = await prisma.account.findFirst({
    where: { customer_id: data.customer_id, status: "ACTIVE" },
  });
  if (!activeAccount) {
    throw new Error("You must have an active bank account before applying for a loan");
  }

  return await prisma.loan.create({
    data: {
      ...data,
      disbursement_account_id: data.disbursement_account_id ?? activeAccount.account_id,
      status: "PENDING",
    },
  });
};

// ────────────────────────────────────────────────────────────
// Fix 2 & 4: Approve — disburse funds + generate EMI schedule
// ────────────────────────────────────────────────────────────
const approveLoan = async (loanId: number, employeeId: number) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const loan = await tx.loan.findUnique({ where: { loan_id: loanId } });
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "PENDING") throw new Error("Only PENDING loans can be approved");

    // Resolve disbursement account
    const disbursementAccountId =
      loan.disbursement_account_id ??
      (
        await tx.account.findFirst({
          where: { customer_id: loan.customer_id, status: "ACTIVE" },
        })
      )?.account_id;

    if (!disbursementAccountId) {
      throw new Error("Customer has no active account to disburse loan funds into");
    }

    const disbursementAccount = await tx.account.findUnique({
      where: { account_id: disbursementAccountId },
    });
    if (!disbursementAccount || disbursementAccount.status !== "ACTIVE") {
      throw new Error("Disbursement account is not active");
    }

    const principal = loan.principal_amount.toNumber();
    const annualRate = loan.interest_rate.toNumber();
    const tenureMonths = loan.tenure_months;
    const emi = calculateEMI(principal, annualRate, tenureMonths);

    const disbursementDate = new Date();
    const maturityDate = new Date(disbursementDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    // 1. Credit principal to customer's account
    await tx.account.update({
      where: { account_id: disbursementAccountId },
      data: { balance: { increment: principal } },
    });

    // 2. Create disbursement transaction record
    await tx.transaction.create({
      data: {
        to_account_id: disbursementAccountId,
        amount: principal,
        type: "LOAN_DISBURSEMENT",
        status: "COMPLETED",
        description: `Loan #${loanId} disbursement (${loan.loan_type})`,
      },
    });

    // 3. Update loan — mark APPROVED, set dates
    const updatedLoan = await tx.loan.update({
      where: { loan_id: loanId },
      data: {
        status: "APPROVED",
        approved_by: employeeId,
        disbursement_account_id: disbursementAccountId,
        disbursement_date: disbursementDate,
        maturity_date: maturityDate,
      },
    });

    // 4. Generate full amortization / EMI schedule
    let outstandingBalance = principal;
    const monthlyRate = annualRate / 12 / 100;
    const scheduleEntries: any[] = [];

    for (let i = 1; i <= tenureMonths; i++) {
      const interestComponent = outstandingBalance * monthlyRate;
      const principalComponent = emi - interestComponent;
      outstandingBalance -= principalComponent;
      const remainingBalance = Math.max(0, outstandingBalance);

      const dueDate = new Date(disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      scheduleEntries.push({
        loan_id: loanId,
        amount_paid: 0,
        principal_component: parseFloat(principalComponent.toFixed(2)),
        interest_component: parseFloat(interestComponent.toFixed(2)),
        remaining_balance: parseFloat(remainingBalance.toFixed(2)),
        due_date: dueDate,
        status: "PENDING",
      });
    }

    await tx.loanRepayment.createMany({ data: scheduleEntries });

    return updatedLoan;
  });
};

// ────────────────────────────────────────────────────────────
// Fix Medium: Reject — use rejected_by field (not approved_by)
// ────────────────────────────────────────────────────────────
const rejectLoan = async (loanId: number, employeeId: number, reason?: string) => {
  const loan = await prisma.loan.findUnique({ where: { loan_id: loanId } });
  if (!loan) throw new Error("Loan not found");
  if (loan.status !== "PENDING") throw new Error("Only PENDING loans can be rejected");

  return await prisma.loan.update({
    where: { loan_id: loanId },
    data: {
      status: "REJECTED",
      rejected_by: employeeId,        // ← correct semantic field
      rejection_reason: reason ?? null,
    },
  });
};

// ────────────────────────────────────────────────────────────
// Repayment — mark the correct scheduled instalment as PAID
// ────────────────────────────────────────────────────────────
const makeRepayment = async (loanId: number, fromAccountId: number, amount: number) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const loan = await tx.loan.findUnique({ where: { loan_id: loanId } });
    if (!loan) throw new Error("Loan not found");
    if (loan.status === "PAID") throw new Error("This loan has already been fully repaid");
    if (loan.status !== "APPROVED") throw new Error("Loan is not active");

    const monthlyRate = loan.interest_rate.toNumber() / 12 / 100;

    // Find the next unpaid scheduled instalment
    const nextInstalment = await tx.loanRepayment.findFirst({
      where: { loan_id: loanId, status: "PENDING" },
      orderBy: { due_date: "asc" },
    });

    // Fallback: compute from last repayment if no schedule found
    const lastRepayment = await tx.loanRepayment.findFirst({
      where: { loan_id: loanId, status: "PAID" },
      orderBy: { repayment_id: "desc" },
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
      data: { balance: { decrement: amount } },
    });

    const transaction = await tx.transaction.create({
      data: {
        from_account_id: fromAccountId,
        amount,
        type: "LOAN_REPAYMENT",
        status: "COMPLETED",
        description: `Loan repayment for loan #${loanId}`,
      },
    });

    const remainingBalance = outstandingBalance - principalComponent;
    const isFinalPayment = remainingBalance <= 0;

    // Update the scheduled instalment if one exists, else create ad-hoc record
    let repaymentRecord;
    if (nextInstalment) {
      repaymentRecord = await tx.loanRepayment.update({
        where: { repayment_id: nextInstalment.repayment_id },
        data: {
          transaction_id: transaction.transaction_id,
          amount_paid: amount,
          principal_component: principalComponent < 0 ? 0 : principalComponent,
          interest_component: interestComponent,
          remaining_balance: isFinalPayment ? 0 : remainingBalance,
          paid_date: new Date(),
          status: "PAID",
        },
      });
    } else {
      repaymentRecord = await tx.loanRepayment.create({
        data: {
          loan_id: loanId,
          transaction_id: transaction.transaction_id,
          amount_paid: amount,
          principal_component: principalComponent < 0 ? 0 : principalComponent,
          interest_component: interestComponent,
          remaining_balance: isFinalPayment ? 0 : remainingBalance,
          due_date: new Date(),
          paid_date: new Date(),
          status: "PAID",
        },
      });
    }

    if (isFinalPayment) {
      await tx.loan.update({ where: { loan_id: loanId }, data: { status: "PAID" } });
    }

    return repaymentRecord;
  });
};

const getLoansByCustomer = async (customerId: number) => {
  return await prisma.loan.findMany({
    where: { customer_id: customerId },
    include: { repayments: true },
  });
};

const getAllLoans = async () => {
  return await prisma.loan.findMany({
    include: {
      repayments: true,
      customer: { select: { first_name: true, last_name: true, email: true } },
    },
    orderBy: { loan_id: "desc" },
  });
};

const getLoanWithDetails = async (loanId: number) => {
  return await prisma.loan.findUnique({
    where: { loan_id: loanId },
    include: {
      repayments: { orderBy: { due_date: "asc" } },
      customer: { select: { first_name: true, last_name: true, email: true } },
    },
  });
};

const getLoanById = async (loanId: number) => {
  return await prisma.loan.findUnique({ where: { loan_id: loanId } });
};

module.exports = {
  calculateEMI,
  applyForLoan,
  approveLoan,
  rejectLoan,
  makeRepayment,
  getAllLoans,
  getLoansByCustomer,
  getLoanWithDetails,
  getLoanById,
};
