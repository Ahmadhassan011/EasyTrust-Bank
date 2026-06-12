const { describe, it, beforeEach, after } = require("node:test");
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
  incrementedAccount: any;
};

// Keep original fetch
const originalFetch = global.fetch;
let mockFetchResult: any = null;

// Mock global.fetch
global.fetch = (async (url: any, options: any): Promise<any> => {
  if (typeof mockFetchResult === "function") {
    return await mockFetchResult(url, options);
  }
  return mockFetchResult;
}) as any;

// Mock prisma.$transaction
prisma.$transaction = async (callback: (tx: any) => Promise<any>) => {
  const mockTx = {
    $executeRaw: async () => {},
    account: {
      findUnique: async () => mockDb.senderAccount,
      update: async (args: any) => {
        if (args.data.balance && args.data.balance.decrement !== undefined) {
          mockDb.updatedAccount = args;
        }
        if (args.data.balance && args.data.balance.increment !== undefined) {
          mockDb.incrementedAccount = args;
        }
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
      update: async (args: any) => {
        if (mockDb.createdTransaction) {
          mockDb.createdTransaction.status = args.data.status;
        }
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
      update: async (args: any) => {
        if (mockDb.createdTransfer) {
          mockDb.createdTransfer.settlement_status = args.data.settlement_status;
          mockDb.createdTransfer.raast_reference = args.data.raast_reference;
          mockDb.createdTransfer.settled_at = args.data.settled_at;
        }
        return mockDb.createdTransfer;
      },
    },
  };
  return await callback(mockTx);
};

// Now import the service under test
const interbankService = require("./interbank.service");

describe("Interbank Transfer Service Unit Tests with Saga Flow", () => {
  beforeEach(() => {
    // Reset standard mock database
    mockDb = {
      senderAccount: {
        account_id: 1,
        account_number: "PK12ETB00000000001",
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
        api_endpoint: "https://api.raast.gov.pk/v1",
        auth_token_hash: "mock-token-1234",
      },
      receiverBank: {
        bank_id: 2,
        swift_code: "RCVRBDKK123",
        bank_name: "Receiver Test Bank",
      },
      createdTransaction: null,
      createdTransfer: null,
      updatedAccount: null,
      incrementedAccount: null,
    };

    // Default successful fetch mock
    mockFetchResult = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        raast_reference: "RST-MOCK-REF-123456",
      }),
    };
  });

  after(() => {
    // Restore fetch
    global.fetch = originalFetch;
  });

  it("should successfully execute an interbank transfer when RAAST returns success", async () => {
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
    assert.strictEqual(result.settlement_status, "SETTLED");
    assert.strictEqual(result.raast_reference, "RST-MOCK-REF-123456");

    // Verify balance was decremented
    assert.ok(mockDb.updatedAccount);
    assert.strictEqual(mockDb.updatedAccount.where.account_id, 1);
    assert.strictEqual(mockDb.updatedAccount.data.balance.decrement, 400.0);

    // Verify no refund was triggered
    assert.strictEqual(mockDb.incrementedAccount, null);

    // Verify transaction fields are final COMPLETED status
    assert.ok(mockDb.createdTransaction);
    assert.strictEqual(mockDb.createdTransaction.status, "COMPLETED");
  });

  it("should trigger compensating refund and fail transaction when RAAST returns success: false", async () => {
    // Mock RAAST failure
    mockFetchResult = {
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        error: { message: "Account number not found at destination bank" },
      }),
    };

    const transferData = {
      fromAccountId: 1,
      amount: 400.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /RAAST network transfer failed: Account number not found at destination bank/
    );

    // Verify debit transaction ran
    assert.ok(mockDb.updatedAccount);
    assert.strictEqual(mockDb.updatedAccount.data.balance.decrement, 400.0);

    // Verify refund (increment) transaction ran
    assert.ok(mockDb.incrementedAccount);
    assert.strictEqual(mockDb.incrementedAccount.where.account_id, 1);
    assert.strictEqual(mockDb.incrementedAccount.data.balance.increment, 400.0);

    // Verify final states in DB are FAILED
    assert.strictEqual(mockDb.createdTransaction.status, "FAILED");
    assert.strictEqual(mockDb.createdTransfer.settlement_status, "FAILED");
  });

  it("should trigger compensating refund when RAAST API throws network error", async () => {
    // Mock network error
    mockFetchResult = async () => {
      throw new Error("Connection Timeout");
    };

    const transferData = {
      fromAccountId: 1,
      amount: 400.0,
      raastNetworkId: 1,
      senderBankSwift: "SNDRBDKK123",
      receiverBankSwift: "RCVRBDKK123",
    };

    await assert.rejects(
      interbankService.createTransfer(transferData),
      /RAAST network transfer failed: Network connection failed/
    );

    // Verify refund was executed
    assert.ok(mockDb.incrementedAccount);
    assert.strictEqual(mockDb.incrementedAccount.data.balance.increment, 400.0);

    // Verify statuses
    assert.strictEqual(mockDb.createdTransaction.status, "FAILED");
    assert.strictEqual(mockDb.createdTransfer.settlement_status, "FAILED");
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
