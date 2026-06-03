const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert");

// Import prisma first so we can mock its methods
const prisma = require("../../config/prisma");

// Mock state variables that tests can customize
let mockDb: {
  senderAccount: any;
  raastNetwork: any;
  receiverBank: any;
  createdTransaction: any;
  createdTransfer: any;
  updatedAccount: any;
};

// Mock prisma.$transaction
prisma.$transaction = async (callback: (tx: any) => Promise<any>) => {
  const mockTx = {
    account: {
      findUnique: async () => mockDb.senderAccount,
      update: async (args: any) => {
        mockDb.updatedAccount = args;
        return args.data;
      },
    },
    raastNetwork: {
      findUnique: async () => mockDb.raastNetwork,
    },
    bank: {
      findUnique: async () => mockDb.receiverBank,
    },
    transaction: {
      create: async (args: any) => {
        mockDb.createdTransaction = {
          transaction_id: 999,
          ...args.data,
        };
        return mockDb.createdTransaction;
      },
    },
    interbankTransfer: {
      create: async (args: any) => {
        mockDb.createdTransfer = {
          transfer_id: 888,
          ...args.data,
          transaction: mockDb.createdTransaction,
          raastNetwork: mockDb.raastNetwork,
        };
        return mockDb.createdTransfer;
      },
    },
  };
  return await callback(mockTx);
};

// Now import the service under test
const interbankService = require("./interbank.service");

describe("Interbank Transfer Service Unit Tests", () => {
  beforeEach(() => {
    // Reset standard mock database
    mockDb = {
      senderAccount: {
        account_id: 1,
        status: "ACTIVE",
        balance: { toNumber: () => 1000.0 },
        branch: {
          bank: {
            swift_code: "SNDRBDKK123",
          },
        },
      },
      raastNetwork: {
        raast_id: 1,
        is_active: true,
        network_name: "Raast Instant Transfer",
      },
      receiverBank: {
        bank_id: 2,
        swift_code: "RCVRBDKK123",
        bank_name: "Receiver Test Bank",
      },
      createdTransaction: null,
      createdTransfer: null,
      updatedAccount: null,
    };
  });

  it("should successfully execute an interbank transfer when all criteria are met", async () => {
    const transferData = {
      fromAccountId: 1,
      amount: 400.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
      raastReference: "REF-123456",
    };

    const result = await interbankService.createTransfer(transferData);

    assert.ok(result);
    assert.strictEqual(result.transfer_id, 888);
    assert.strictEqual(result.transaction_id, 999);
    assert.strictEqual(result.sender_bank_swift, "SNDRBDKK123");
    assert.strictEqual(result.receiver_bank_swift, "RCVRBDKK123");
    assert.strictEqual(result.raast_reference, "REF-123456");

    // Verify balance was decremented
    assert.ok(mockDb.updatedAccount);
    assert.strictEqual(mockDb.updatedAccount.where.account_id, 1);
    assert.strictEqual(mockDb.updatedAccount.data.balance.decrement, 400.0);

    // Verify transaction fields
    assert.ok(mockDb.createdTransaction);
    assert.strictEqual(mockDb.createdTransaction.from_account_id, 1);
    assert.strictEqual(mockDb.createdTransaction.amount, 400.0);
    assert.strictEqual(mockDb.createdTransaction.type, "INTERBANK_TRANSFER");
    assert.strictEqual(mockDb.createdTransaction.status, "COMPLETED");
  });

  it("should throw an error if the sender account is not found", async () => {
    mockDb.senderAccount = null;

    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /Sender account not found/
    );
  });

  it("should throw an error if the sender account is not active", async () => {
    mockDb.senderAccount.status = "INACTIVE";

    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /Sender account is not active/
    );
  });

  it("should throw an error if the sender SWIFT code does not match the sender account's bank SWIFT code", async () => {
    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "WRONGSWIFT12",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /Sender bank SWIFT code does not match the account bank/
    );
  });

  it("should throw an error if the RAAST network is not found", async () => {
    mockDb.raastNetwork = null;

    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /RAAST network not found/
    );
  });

  it("should throw an error if the RAAST network is not active", async () => {
    mockDb.raastNetwork.is_active = false;

    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /RAAST network is not active/
    );
  });

  it("should throw an error if the receiver bank is not found", async () => {
    mockDb.receiverBank = null;

    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "WRONGRECV123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /Receiver bank not found/
    );
  });

  it("should throw an error if the sender account has insufficient funds", async () => {
    mockDb.senderAccount.balance = { toNumber: () => 50.0 };

    const transferData = {
      fromAccountId: 1,
      amount: 100.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /Insufficient funds/
    );
  });
});
