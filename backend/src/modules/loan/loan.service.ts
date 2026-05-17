const prisma = require("../../config/prisma");

/**
 * Calculates the monthly EMI using the Reducing Balance method.
 * Formula: P * r * (1+r)^n / ((1+r)^n - 1)
 */
const calculateEMI = (principal: number, annualRate: number, tenureMonths: number) => {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi;
};

const applyForLoan = async (data: any) => {
  // 1. Calculate and save details
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

const getLoansByCustomer = async (customerId: number) => {
  return await prisma.loan.findMany({
    where: { customer_id: customerId },
    include: { repayments: true }
  });
};

module.exports = {
  calculateEMI,
  applyForLoan,
  approveLoan,
  getLoansByCustomer
};
