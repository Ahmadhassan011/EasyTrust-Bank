const prisma = require("../../config/prisma");

const createAccount = async (data: any) => {
  // Generate a unique account number if not provided
  // Pattern: ETB (EasyTrust Bank) + Branch ID + Random 8 digits
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
