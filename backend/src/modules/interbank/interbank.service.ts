import type { Prisma } from "@prisma/client";
const crypto = require("crypto");
const prisma = require("../../config/prisma");

const idempotencyStore = new Map<string, { result: any; expiresAt: number }>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

const checkIdempotency = (key: string) => {
  const entry = idempotencyStore.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.result;
  return null;
};

const setIdempotency = (key: string, result: any) => {
  idempotencyStore.set(key, { result, expiresAt: Date.now() + IDEMPOTENCY_TTL });
};

const createTransfer = async (
  data: {
    fromAccountId: number;
    amount: number;
    raastNetworkId: number;
    senderBankSwift: string;
    receiverBankSwift: string;
    raastReference?: string;
  },
  idempotencyKey?: string
) => {
  if (idempotencyKey) {
    const existing = checkIdempotency(idempotencyKey);
    if (existing) return existing;
  }

  if (!data.raastReference) {
    data.raastReference = `RST-${crypto.randomUUID()}`;
  }

  // Step 1: Execute DB Transaction to debit account and log PENDING state
  const { transaction, transfer, senderAccount, raastNetwork } = await prisma.$transaction(async (tx: any) => {
    await tx.$executeRaw`SELECT balance FROM account WHERE account_id = ${data.fromAccountId} FOR UPDATE`;

    const sender = await tx.account.findUnique({
      where: { account_id: data.fromAccountId },
      include: {
        branch: {
          include: {
            bank: true,
          },
        },
      },
    });

    if (!sender) {
      throw new Error("Sender account not found");
    }

    if (sender.status !== "ACTIVE") {
      throw new Error("Sender account is not active");
    }

    if (sender.branch.bank.swift_code !== data.senderBankSwift) {
      throw new Error("Sender bank SWIFT code does not match the account bank");
    }

    const network = await tx.raastNetwork.findUnique({
      where: { raast_id: data.raastNetworkId },
    });

    if (!network) {
      throw new Error("RAAST network not found");
    }

    if (!network.is_active) {
      throw new Error("RAAST network is not active");
    }

    const receiverBank = await tx.bank.findUnique({
      where: { swift_code: data.receiverBankSwift },
    });

    if (!receiverBank) {
      throw new Error("Receiver bank not found");
    }

    if (sender.balance.toNumber() < data.amount) {
      throw new Error("Insufficient funds");
    }

    // Debit the sender account
    await tx.account.update({
      where: { account_id: data.fromAccountId },
      data: { balance: { decrement: data.amount } },
    });

    // Create pending local transaction record
    const localTx = await tx.transaction.create({
      data: {
        from_account_id: data.fromAccountId,
        amount: data.amount,
        type: "INTERBANK_TRANSFER",
        status: "PENDING",
        description: `Interbank transfer to SWIFT ${data.receiverBankSwift}`,
      },
    });

    // Create pending interbank transfer record
    const localTransfer = await tx.interbankTransfer.create({
      data: {
        transaction_id: localTx.transaction_id,
        raast_network_id: data.raastNetworkId,
        sender_bank_swift: data.senderBankSwift,
        receiver_bank_swift: data.receiverBankSwift,
        raast_reference: data.raastReference ?? null,
        settlement_status: "PENDING",
      },
    });

    return { transaction: localTx, transfer: localTransfer, senderAccount: sender, raastNetwork: network };
  });

  // Step 2: Make the HTTP request to RAAST Network API (outside database transaction)
  let response;
  let responseData: any;
  try {
    const apiEndpoint = raastNetwork.api_endpoint.endsWith("/") 
      ? `${raastNetwork.api_endpoint}transfers`
      : `${raastNetwork.api_endpoint}/transfers`;

    response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${raastNetwork.auth_token_hash}`,
      },
      body: JSON.stringify({
        sender_account_number: senderAccount.account_number,
        sender_bank_swift: data.senderBankSwift,
        receiver_bank_swift: data.receiverBankSwift,
        amount: data.amount,
        transaction_id: transaction.transaction_id,
      }),
    });

    if (response.ok) {
      responseData = await response.json();
    }
  } catch (error: any) {
    console.error("RAAST API Request Error:", error.message);
  }

  // Step 3: Handle RAAST network response
  if (response && response.ok && responseData && responseData.success) {
    // Commit: Update status to COMPLETED / SETTLED
    const settledTransfer = await prisma.$transaction(async (tx: any) => {
      const updatedTransfer = await tx.interbankTransfer.update({
        where: { transfer_id: transfer.transfer_id },
        data: {
          settlement_status: "SETTLED",
          raast_reference: responseData.raast_reference || data.raastReference || `RST-${Date.now()}`,
          settled_at: new Date(),
        },
        include: {
          transaction: true,
          raastNetwork: true,
        },
      });

      await tx.transaction.update({
        where: { transaction_id: transaction.transaction_id },
        data: { status: "COMPLETED" },
      });

      return updatedTransfer;
    });

    if (idempotencyKey) setIdempotency(idempotencyKey, settledTransfer);
    return settledTransfer;
  } else {
    // Rollback / Compensating Transaction: Refund the customer and set status to FAILED
    const errorMessage = responseData && responseData.error && responseData.error.message 
      ? responseData.error.message 
      : (response ? `HTTP Error ${response.status}` : "Network connection failed");

    try {
      await prisma.$transaction(async (tx: any) => {
        // Refund the amount to the sender account
        await tx.account.update({
          where: { account_id: data.fromAccountId },
          data: { balance: { increment: data.amount } },
        });

        // Set local transaction to FAILED
        await tx.transaction.update({
          where: { transaction_id: transaction.transaction_id },
          data: { status: "FAILED" },
        });

        // Set interbank transfer to FAILED
        await tx.interbankTransfer.update({
          where: { transfer_id: transfer.transfer_id },
          data: { settlement_status: "FAILED" },
        });
      });
    } catch (refundError: any) {
      console.error("CRITICAL ERROR: Failed to execute compensating refund transaction", refundError.message);
      throw new Error(`RAAST transfer failed and compensating refund failed: ${refundError.message}. Manual intervention required.`);
    }

    throw new Error(`RAAST network transfer failed: ${errorMessage}`);
  }
};

const getSettlementStatus = async (transferId: number) => {
  const transfer = await prisma.interbankTransfer.findUnique({
    where: { transfer_id: transferId },
    include: {
      transaction: true,
      raastNetwork: true,
    },
  });

  if (!transfer) {
    throw new Error("Interbank transfer not found");
  }

  return transfer;
};

module.exports = { createTransfer, getSettlementStatus };