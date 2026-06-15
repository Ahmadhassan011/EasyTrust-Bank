const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

// ────────────────────────────────────────────────────────────
// Fix 6: Luhn Algorithm card number generation
// Real cards use: BIN prefix (6 digits) + account number + Luhn check digit
// We use a fictional BIN: 426735 (Visa-style prefix for EasyTrust)
// ────────────────────────────────────────────────────────────
const EASYTRUST_BIN = "426735"; // 6-digit Bank Identification Number

const luhnCheckDigit = (partialNumber: string): number => {
  const digits = partialNumber.split("").map(Number).reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 0) {           // double every 2nd digit from right
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
};

const generateLuhnCardNumber = (): string => {
  // BIN (6) + random 9 account digits = 15 digits, then append Luhn check digit
  let accountPart = "";
  for (let i = 0; i < 9; i++) {
    accountPart += Math.floor(Math.random() * 10).toString();
  }
  const partial = EASYTRUST_BIN + accountPart;
  const checkDigit = luhnCheckDigit(partial);
  return partial + checkDigit; // 16-digit Luhn-valid card number
};

const generateUniqueCardNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const cardNumber = generateLuhnCardNumber();
    const existing = await prisma.card.findUnique({ where: { card_number: cardNumber } });
    if (!existing) return cardNumber;
  }
  throw new Error("Failed to generate a unique card number. Please try again.");
};

// ────────────────────────────────────────────────────────────
// Fix 7: Card PIN system
// Real banks require a 4-digit PIN for ATM/POS transactions
// PIN is hashed — only the customer knows the plaintext PIN
// ────────────────────────────────────────────────────────────
const createCard = async (data: {
  account_id: number;
  card_type: string;
  daily_limit?: number;
  pin: string; // 4-digit PIN required at card issuance
}) => {
  if (!data.pin || !/^\d{4}$/.test(data.pin)) {
    throw new Error("A 4-digit numeric PIN is required to issue a card");
  }

  const account = await prisma.account.findUnique({
    where: { account_id: data.account_id },
  });

  if (!account) throw new Error("Account not found");
  if (account.status !== "ACTIVE") throw new Error("Cannot issue card for a non-active account");

  const cardNumber = await generateUniqueCardNumber();
  const cvv = Math.floor(100 + Math.random() * 900).toString();
  const cvv_hash = await bcrypt.hash(cvv, 12);
  const pin_hash = await bcrypt.hash(data.pin, 12);

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);

  const card = await prisma.card.create({
    data: {
      account_id: data.account_id,
      card_number: cardNumber,
      card_type: data.card_type,
      expiry_date: expiryDate,
      cvv_hash,
      pin_hash,
      daily_limit: data.daily_limit ?? 50000.0,
      status: "ACTIVE",
    },
  });

  // Return plaintext CVV & PIN once only (like a real bank mailer)
  return {
    ...card,
    cvv,    // shown once — never stored in plaintext
    pin: data.pin, // shown once — never stored in plaintext
  };
};

// ────────────────────────────────────────────────────────────
// Fix 7: Verify PIN — used for ATM/POS transaction auth
// ────────────────────────────────────────────────────────────
const verifyPin = async (cardId: number, pin: string): Promise<boolean> => {
  const card = await prisma.card.findUnique({ where: { card_id: cardId } });
  if (!card) throw new Error("Card not found");
  if (card.status !== "ACTIVE") throw new Error("Card is not active");
  if (!card.pin_hash) throw new Error("No PIN set for this card");

  const valid = await bcrypt.compare(pin, card.pin_hash);
  return valid;
};

// ────────────────────────────────────────────────────────────
// Fix 7: Change PIN
// ────────────────────────────────────────────────────────────
const changePin = async (cardId: number, oldPin: string, newPin: string): Promise<void> => {
  if (!/^\d{4}$/.test(newPin)) throw new Error("New PIN must be a 4-digit number");

  const card = await prisma.card.findUnique({ where: { card_id: cardId } });
  if (!card) throw new Error("Card not found");
  if (!card.pin_hash) throw new Error("No PIN set for this card");

  const valid = await bcrypt.compare(oldPin, card.pin_hash);
  if (!valid) throw new Error("Current PIN is incorrect");

  const new_pin_hash = await bcrypt.hash(newPin, 12);
  await prisma.card.update({
    where: { card_id: cardId },
    data: { pin_hash: new_pin_hash },
  });
};

const getCardById = async (id: number) => {
  return await prisma.card.findUnique({
    where: { card_id: id },
    include: {
      account: {
        include: {
          customer: {
            select: { first_name: true, last_name: true, email: true },
          },
        },
      },
    },
  });
};

const getCardsByAccountId = async (accountId: number) => {
  return await prisma.card.findMany({ where: { account_id: accountId } });
};

const updateCardStatus = async (id: number, status: string) => {
  return await prisma.card.update({ where: { card_id: id }, data: { status } });
};

const updateCardLimit = async (id: number, limit: number) => {
  return await prisma.card.update({ where: { card_id: id }, data: { daily_limit: limit } });
};

const deleteCard = async (id: number) => {
  return await prisma.card.delete({ where: { card_id: id } });
};

module.exports = {
  createCard,
  verifyPin,
  changePin,
  getCardById,
  getCardsByAccountId,
  updateCardStatus,
  updateCardLimit,
  deleteCard,
};
