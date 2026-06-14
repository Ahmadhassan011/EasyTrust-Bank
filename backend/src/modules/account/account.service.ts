const prisma = require("../../config/prisma");

const generateAccountNumber = async (branchId: number): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    const candidate = `ETB${branchId}${suffix}`;
    const existing = await prisma.account.findUnique({ where: { account_number: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Failed to generate a unique account number. Please try again.");
};

const createAccount = async (data: any) => {
  const customer = await prisma.customer.findUnique({ where: { customer_id: data.customer_id } });
  if (!customer) {
    throw new Error("Customer not found");
  }
  if (customer.kyc_status !== "VERIFIED") {
    throw new Error("KYC must be VERIFIED before opening an account");
  }

  if (!data.account_number) {
    data.account_number = await generateAccountNumber(data.branch_id);
  }

  return await prisma.account.create({
    data,
  });
};

const getAllAccounts = async () => {
  return await prisma.account.findMany({
    include: {
      customer: {
        select: {
          first_name: true,
          last_name: true,
          email: true
        }
      },
      branch: {
        select: {
          branch_name: true,
          city: true
        }
      }
    }
  });
};

const getAccountById = async (id: number) => {
  return await prisma.account.findUnique({
    where: { account_id: id },
    include: {
      customer: true,
      branch: true
    }
  });
};

const getAccountsByCustomerId = async (customerId: number) => {
  return await prisma.account.findMany({
    where: { customer_id: customerId }
  });
};

const updateAccountStatus = async (id: number, status: string) => {
  return await prisma.account.update({
    where: { account_id: id },
    data: { status }
  });
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  getAccountsByCustomerId,
  updateAccountStatus
};
