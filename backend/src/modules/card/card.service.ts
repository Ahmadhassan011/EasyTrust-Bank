const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

const generateUniqueCardNumber = async (): Promise<string> => {
  let isUnique = false;
  let cardNumber = "";
  
  while (!isUnique) {
    // Generate a random 16-digit card number
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

const createCard = async (data: { account_id: number; card_type: string; daily_limit?: number }) => {
  const account = await prisma.account.findUnique({
    where: { account_id: data.account_id }
  });
  
  if (!account) {
    throw new Error("Account not found");
  }
  
  if (account.status !== "ACTIVE") {
    throw new Error("Cannot issue card for a non-active account");
  }
  
  const cardNumber = await generateUniqueCardNumber();
  const cvv = Math.floor(100 + Math.random() * 900).toString();
  const cvv_hash = await bcrypt.hash(cvv, 12);
  
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);
  
  const card = await prisma.card.create({
    data: {
      account_id: data.account_id,
      card_number: cardNumber,
      card_type: data.card_type,
      expiry_date: expiryDate,
      cvv_hash,
      daily_limit: data.daily_limit ?? 50000.00,
      status: "ACTIVE",
    }
  });
  
  // Return the created card details and the plaintext CVV only on creation
  return {
    ...card,
    cvv // return plaintext CVV to show once
  };
};

const getCardById = async (id: number) => {
  return await prisma.card.findUnique({
    where: { card_id: id },
    include: {
      account: {
        include: {
          customer: {
            select: {
              first_name: true,
              last_name: true,
              email: true
            }
          }
        }
      }
    }
  });
};

const getCardsByAccountId = async (accountId: number) => {
  return await prisma.card.findMany({
    where: { account_id: accountId }
  });
};

const updateCardStatus = async (id: number, status: string) => {
  return await prisma.card.update({
    where: { card_id: id },
    data: { status }
  });
};

const updateCardLimit = async (id: number, limit: number) => {
  return await prisma.card.update({
    where: { card_id: id },
    data: { daily_limit: limit }
  });
};

const deleteCard = async (id: number) => {
  return await prisma.card.delete({
    where: { card_id: id }
  });
};

module.exports = {
  createCard,
  getCardById,
  getCardsByAccountId,
  updateCardStatus,
  updateCardLimit,
  deleteCard
};
