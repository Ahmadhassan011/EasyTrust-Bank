const prisma = require("../../config/prisma");

const createAccount = async (data: any) => {
  const customer = await prisma.customer.findUnique({ where: { customer_id: data.customer_id } });
  if (!customer) {
    throw new Error("Customer not found");
  }
  if (customer.kyc_status !== "VERIFIED") {
    throw new Error("KYC must be VERIFIED before opening an account");
  }

  if (!data.account_number) {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    data.account_number = `ETB${data.branch_id}${randomSuffix}`;
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
