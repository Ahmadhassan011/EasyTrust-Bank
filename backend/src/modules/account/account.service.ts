const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

const generateAccountNumber = async (): Promise<string> => {
  let isUnique = false;
  let accountNumber = "";

  while (!isUnique) {
    // Generate a random 10-digit number as string
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const existing = await prisma.account.findUnique({
      where: { account_number: accountNumber }
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return accountNumber;
};

const generateCardNumber = async (): Promise<string> => {
  let isUnique = false;
  let cardNumber = "";

  while (!isUnique) {
    // Generate a random 16-digit number as string
    cardNumber = "";
    for (let i = 0; i < 4; i++) {
      cardNumber += Math.floor(1000 + Math.random() * 9000).toString();
    }
    const existing = await prisma.card.findUnique({
      where: { card_number: cardNumber }
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return cardNumber;
};

const createAccount = async (data: {
  customer_id: number;
  branch_id: number;
  account_type: string;
  currency: string;
}) => {
  // Check if customer exists
  const customer = await prisma.customer.findUnique({
    where: { customer_id: data.customer_id }
  });
  if (!customer) throw new Error("Customer not found");

  // Check if branch exists
  const branch = await prisma.branch.findUnique({
    where: { branch_id: data.branch_id }
  });
  if (!branch) throw new Error("Branch not found");

  const accountNumber = await generateAccountNumber();

  return await prisma.account.create({
    data: {
      customer_id: data.customer_id,
      branch_id: data.branch_id,
      account_number: accountNumber,
      account_type: data.account_type,
      currency: data.currency,
      balance: 0.00,
      status: "ACTIVE"
    }
  });
};

const getAccountBalance = async (accountId: number) => {
  const account = await prisma.account.findUnique({
    where: { account_id: accountId },
    select: {
      account_id: true,
      account_number: true,
      balance: true,
      currency: true,
      status: true
    }
  });

  if (!account) throw new Error("Account not found");
  return account;
};

const getCustomerAccounts = async (customerId: number) => {
  return await prisma.account.findMany({
    where: { customer_id: customerId }
  });
};

const issueCard = async (data: {
  account_id: number;
  card_type: string;
  daily_limit: number;
}) => {
  const account = await prisma.account.findUnique({
    where: { account_id: data.account_id }
  });
  if (!account) throw new Error("Account not found");

  const cardNumber = await generateCardNumber();
  const cvv = Math.floor(100 + Math.random() * 900).toString(); // 3 digit CVV
  const cvvHash = await bcrypt.hash(cvv, 10);

  // Expiry date is 5 years from now
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);

  const card = await prisma.card.create({
    data: {
      account_id: data.account_id,
      card_number: cardNumber,
      card_type: data.card_type,
      expiry_date: expiryDate,
      cvv_hash: cvvHash,
      daily_limit: data.daily_limit,
      status: "ACTIVE"
    }
  });

  return {
    ...card,
    cvv // Return CVV in plaintext only once upon creation
  };
};

module.exports = {
  createAccount,
  getAccountBalance,
  getCustomerAccounts,
  issueCard
};
