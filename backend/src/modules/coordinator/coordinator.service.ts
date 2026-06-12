const prisma = require("../../config/prisma");
const { redisClient } = require("../../config/redis");
const crypto = require("crypto");

const executeTwoPhaseCommit = async (data: {
  sender_account_id: number;
  receiver_bank_swift: string;
  receiver_account_number: string;
  amount: number;
  raast_network_id: number;
  description?: string;
}) => {
  const { sender_account_id, receiver_bank_swift, receiver_account_number, amount, raast_network_id, description } = data;
  const lockKey = `lock:account:${sender_account_id}`;
  
  // Phase 1: Prepare
  console.log(`[2PC Coordinator] Starting Phase 1 (Prepare) for account ${sender_account_id}`);
  
  // 1. Acquire Redis Lock on Sender Account (15 second timeout to prevent deadlocks)
  const acquired = await redisClient.set(lockKey, "locked", {
    NX: true,
    PX: 15000
  });

  if (!acquired) {
    console.error(`[2PC Coordinator] Phase 1 Failed: Unable to acquire lock on account ${sender_account_id}`);
    throw new Error("Account is currently locked by another transaction. Please try again.");
  }

  let transactionId: number | null = null;
  let prepareSuccessful = false;

  try {
    // 2. Fetch sender account details and verify funds inside a database transaction block
    await prisma.$transaction(async (tx: any) => {
      const sender = await tx.account.findUnique({
        where: { account_id: sender_account_id }
      });

      if (!sender) throw new Error("Sender account not found");
      if (sender.status !== "ACTIVE") throw new Error("Sender account is not active");
      if (Number(sender.balance) < amount) throw new Error("Insufficient balance for transfer");

      // Verify Raast network profile is active
      const raastProfile = await tx.raastNetwork.findUnique({
        where: { raast_id: raast_network_id }
      });
      if (!raastProfile || !raastProfile.is_active) {
        throw new Error("Specified Raast network is inactive or invalid");
      }

      // 3. Deduct/Reserve funds immediately from sender balance
      await tx.account.update({
        where: { account_id: sender_account_id },
        data: { balance: { decrement: amount } }
      });

      // 4. Create local transaction record in PENDING state
      const localTx = await tx.transaction.create({
        data: {
          from_account_id: sender_account_id,
          amount,
          type: "INTERBANK_TRANSFER",
          status: "PENDING",
          description: description || `Raast interbank transfer of ${amount} to ${receiver_account_number} at bank ${receiver_bank_swift}`
        }
      });

      transactionId = localTx.transaction_id;
    });

    // 5. Simulate External Raast Network Participant Consent (Phase 1 Ready check)
    console.log(`[2PC Coordinator] Querying Raast Network for receiver consent...`);
    
    // Simulate slight network delay of 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simple simulator decision: 95% success rate, or we can just assume success
    const raastConsent = Math.random() < 0.98;
    if (!raastConsent) {
      throw new Error("Raast Network Participant bank refused connection or account validation failed");
    }

    console.log(`[2PC Coordinator] Phase 1 (Prepare) successful. All participants are READY.`);
    prepareSuccessful = true;

  } catch (error: any) {
    console.error(`[2PC Coordinator] Phase 1 Failed due to: ${error.message}. Aborting...`);
    
    // Phase 2: Rollback / Abort
    await rollback(sender_account_id, amount, transactionId, lockKey);
    throw error;
  }

  // Phase 2: Commit
  if (prepareSuccessful && transactionId) {
    try {
      console.log(`[2PC Coordinator] Starting Phase 2 (Commit) for transaction ${transactionId}`);
      
      const raastRef = "RAAST-" + crypto.randomBytes(6).toString("hex").toUpperCase();

      await prisma.$transaction(async (tx: any) => {
        // 1. Confirm transaction status as COMPLETED
        await tx.transaction.update({
          where: { transaction_id: transactionId },
          data: { status: "COMPLETED" }
        });

        // 2. Create interbank transfer ledger entry
        await tx.interbankTransfer.create({
          data: {
            transaction_id: transactionId,
            raast_network_id: raast_network_id,
            sender_bank_swift: "ABPAPKKA949", // EasyTrust Bank SWIFT code
            receiver_bank_swift: receiver_bank_swift,
            raast_reference: raastRef,
            settlement_status: "SETTLED",
            settled_at: new Date()
          }
        });
      });

      console.log(`[2PC Coordinator] Commit Successful. Transaction ${transactionId} finalized with reference ${raastRef}.`);
      
      // 3. Release Redis Lock
      await redisClient.del(lockKey);
      
      return {
        success: true,
        transaction_id: transactionId,
        raast_reference: raastRef,
        message: "Interbank transfer settled successfully"
      };

    } catch (commitError: any) {
      console.error(`[2PC Coordinator] Critical: Phase 2 Commit failed! Attempting Rollback...`, commitError);
      await rollback(sender_account_id, amount, transactionId, lockKey);
      throw commitError;
    }
  }
};

const rollback = async (senderAccountId: number, amount: number, transactionId: number | null, lockKey: string) => {
  console.log(`[2PC Coordinator] Executing Rollback for account ${senderAccountId}`);
  try {
    await prisma.$transaction(async (tx: any) => {
      // 1. Refund the reserved funds to the sender's account balance
      await tx.account.update({
        where: { account_id: senderAccountId },
        data: { balance: { increment: amount } }
      });

      // 2. Mark the local transaction record as FAILED
      if (transactionId) {
        await tx.transaction.update({
          where: { transaction_id: transactionId },
          data: { status: "FAILED" }
        });
      }
    });
    console.log(`[2PC Coordinator] Rollback completed successfully.`);
  } catch (rollbackError) {
    console.error(`[2PC Coordinator] Critical failure during rollback!`, rollbackError);
  } finally {
    // 3. Release Redis lock
    await redisClient.del(lockKey);
  }
};

module.exports = {
  executeTwoPhaseCommit
};
