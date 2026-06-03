const prisma = require("../../config/prisma");

const createTransfer = async (data: {
  fromAccountId: number;
  amount: number;
  raastNetworkId: number;
  senderBankSwift: string;
  receiverBankSwift: string;
  raastReference?: string;
}) => {
  return await prisma.$transaction(async (tx: any) => {
    const senderAccount = await tx.account.findUnique({
      where: { account_id: data.fromAccountId },
      include: {
        branch: {
          include: {
            bank: true,
          },
        },
      },
    });

    if (!senderAccount) {
      throw new Error("Sender account not found");
    }

    if (senderAccount.status !== "ACTIVE") {
      throw new Error("Sender account is not active");
    }

    if (senderAccount.branch.bank.swift_code !== data.senderBankSwift) {
      throw new Error("Sender bank SWIFT code does not match the account bank");
    }

    const raastNetwork = await tx.raastNetwork.findUnique({
      where: { raast_id: data.raastNetworkId },
    });

    if (!raastNetwork) {
      throw new Error("RAAST network not found");
    }

    if (!raastNetwork.is_active) {
      throw new Error("RAAST network is not active");
    }

    const receiverBank = await tx.bank.findUnique({
      where: { swift_code: data.receiverBankSwift },
    });

    if (!receiverBank) {
      throw new Error("Receiver bank not found");
    }

    if (senderAccount.balance.toNumber() < data.amount) {
      throw new Error("Insufficient funds");
    }

    await tx.account.update({
      where: { account_id: data.fromAccountId },
      data: { balance: { decrement: data.amount } },
    });

    const transaction = await tx.transaction.create({
      data: {
        from_account_id: data.fromAccountId,
        amount: data.amount,
        type: "INTERBANK_TRANSFER",
        status: "COMPLETED",
      },
    });

    const transfer = await tx.interbankTransfer.create({
      data: {
        transaction_id: transaction.transaction_id,
        raast_network_id: data.raastNetworkId,
        sender_bank_swift: data.senderBankSwift,
        receiver_bank_swift: data.receiverBankSwift,
        raast_reference: data.raastReference ?? null,
      },
      include: {
        transaction: true,
        raastNetwork: true,
      },
    });

    return transfer;
  });
};

module.exports = { createTransfer };