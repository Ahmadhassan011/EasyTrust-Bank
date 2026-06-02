const prisma = require("../../config/prisma");
const auditService = require("../audit/audit.service");

const applyLoan = async (data: {
  customer_id: number;
  branch_id: number;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  loan_type: string;
}) => {
  // Check customer and branch exist
  const customer = await prisma.customer.findUnique({ where: { customer_id: data.customer_id } });
  if (!customer) throw new Error("Customer not found");

  const branch = await prisma.branch.findUnique({ where: { branch_id: data.branch_id } });
  if (!branch) throw new Error("Branch not found");

  return await prisma.loan.create({
    data: {
      customer_id: data.customer_id,
      branch_id: data.branch_id,
      principal_amount: data.principal_amount,
      interest_rate: data.interest_rate,
      tenure_months: data.tenure_months,
      loan_type: data.loan_type,
      status: "PENDING"
    }
  });
};

const approveLoan = async (loanId: number, employeeId: number, status: "APPROVED" | "REJECTED") => {
  return await prisma.$transaction(async (tx: any) => {
    const loan = await tx.loan.findUnique({
      where: { loan_id: loanId }
    });

    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "PENDING") throw new Error("Loan has already been reviewed");

    if (status === "REJECTED") {
      const updated = await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "REJECTED",
          approved_by: employeeId
        }
      });
      await auditService.logAuditEvent(employeeId, "loan", loanId, "LOAN_REJECTED", "PENDING", "REJECTED");
      return updated;
    }

    // Find the customer's first active account to disburse funds to
    const customerAccount = await tx.account.findFirst({
      where: {
        customer_id: loan.customer_id,
        status: "ACTIVE"
      }
    });

    if (!customerAccount) {
      throw new Error("Customer does not have an active bank account to disburse funds to");
    }

    // Calculate Amortization schedule
    const P = Number(loan.principal_amount);
    const R = Number(loan.interest_rate);
    const n = loan.tenure_months;
    const r = R / 12 / 100; // Monthly interest rate

    let EMI = 0;
    if (r === 0) {
      EMI = P / n;
    } else {
      EMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    let remainingPrincipal = P;
    const repayments = [];

    const disbursementDate = new Date();
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + n);

    // Disburse funds: increment account balance
    await tx.account.update({
      where: { account_id: customerAccount.account_id },
      data: { balance: { increment: loan.principal_amount } }
    });

    // Create loan disbursement transaction
    const disbursementTx = await tx.transaction.create({
      data: {
        to_account_id: customerAccount.account_id,
        amount: loan.principal_amount,
        type: "LOAN_DISBURSEMENT",
        status: "COMPLETED",
        description: `Disbursement of principal for loan ID: ${loanId}`
      }
    });

    // Generate amortization installments
    for (let i = 1; i <= n; i++) {
      const interestComponent = remainingPrincipal * r;
      const principalComponent = EMI - interestComponent;
      const remainingBalance = remainingPrincipal - principalComponent;

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      repayments.push({
        loan_id: loanId,
        amount_paid: EMI,
        principal_component: principalComponent,
        interest_component: interestComponent,
        remaining_balance: Math.max(0, remainingBalance),
        due_date: dueDate,
        status: "PENDING"
      });

      remainingPrincipal = remainingBalance;
    }

    // Bulk insert repayments using prisma createMany
    await tx.loanRepayment.createMany({
      data: repayments
    });

    // Update Loan status
    const updatedLoan = await tx.loan.update({
      where: { loan_id: loanId },
      data: {
        status: "APPROVED",
        approved_by: employeeId,
        disbursement_date: disbursementDate,
        maturity_date: maturityDate
      },
      include: {
        repayments: true
      }
    });

    await auditService.logAuditEvent(employeeId, "loan", loanId, "LOAN_APPROVED", "PENDING", "APPROVED");

    return {
      loan: updatedLoan,
      disbursed_to: customerAccount.account_number,
      disbursement_transaction_id: disbursementTx.transaction_id
    };
  });
};

const repayLoan = async (loanId: number, accountId: number, amount: number) => {
  return await prisma.$transaction(async (tx: any) => {
    const loan = await tx.loan.findUnique({
      where: { loan_id: loanId }
    });

    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "APPROVED") throw new Error("Loan is not in approved state");

    // Fetch account to deduct from
    const account = await tx.account.findUnique({
      where: { account_id: accountId }
    });

    if (!account) throw new Error("Repayment account not found");
    if (account.status !== "ACTIVE") throw new Error("Repayment account is not active");
    if (Number(account.balance) < amount) throw new Error("Insufficient account balance");

    // Find the oldest pending repayment
    const repayment = await tx.loanRepayment.findFirst({
      where: {
        loan_id: loanId,
        status: "PENDING"
      },
      orderBy: { due_date: "asc" }
    });

    if (!repayment) {
      throw new Error("No pending installments found. Loan may be fully repaid.");
    }

    // Deduct from account
    await tx.account.update({
      where: { account_id: accountId },
      data: { balance: { decrement: amount } }
    });

    // Create loan repayment transaction
    const repaymentTx = await tx.transaction.create({
      data: {
        from_account_id: accountId,
        amount,
        type: "LOAN_REPAYMENT",
        status: "COMPLETED",
        description: `Installment payment for loan ID: ${loanId}`
      }
    });

    // Update the repayment record
    const updatedRepayment = await tx.loanRepayment.update({
      where: { repayment_id: repayment.repayment_id },
      data: {
        status: "PAID",
        paid_date: new Date(),
        transaction_id: repaymentTx.transaction_id
      }
    });

    // Check if there are any remaining pending repayments
    const remainingPending = await tx.loanRepayment.count({
      where: {
        loan_id: loanId,
        status: "PENDING"
      }
    });

    if (remainingPending === 0) {
      // Mark loan as fully repaid
      await tx.loan.update({
        where: { loan_id: loanId },
        data: { status: "COMPLETED" }
      });
    }

    return {
      repayment: updatedRepayment,
      remaining_pending_installments: remainingPending,
      transaction_id: repaymentTx.transaction_id
    };
  });
};

const getLoans = async () => {
  return await prisma.loan.findMany({
    include: {
      repayments: {
        orderBy: { due_date: "asc" }
      }
    }
  });
};

module.exports = {
  applyLoan,
  approveLoan,
  repayLoan,
  getLoans
};
