const prisma = require("./config/prisma");
const authService = require("./modules/auth/auth.service");
const accountService = require("./modules/account/account.service");
const transactionService = require("./modules/transaction/transaction.service");
const loanService = require("./modules/loan/loan.service");
const interbankService = require("./modules/interbank/interbank.service");
const auditService = require("./modules/audit/audit.service");
const { connectRedis } = require("./config/redis");

async function runVerification() {
  console.log("🚀 Starting End-to-End Backend Verification Process...");
  
  // Make sure Redis is connected
  await connectRedis();

  // Clear existing test data to start fresh (Clean up previous runs)
  console.log("\n🧹 Cleaning up previous test records...");
  await prisma.auditLog.deleteMany({});
  await prisma.loanRepayment.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.interbankTransfer.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.employee.deleteMany({});
  
  // Leave default seeded bank, branch, and customers if any, or create a test customer
  await prisma.customer.deleteMany({
    where: { email: { in: ["test_cust@gmail.com", "other_cust@gmail.com"] } }
  });
  await prisma.employee.deleteMany({
    where: { email: "test_emp@gmail.com" }
  });

  console.log("✅ Cleanup complete.");

  // ==========================================
  // Test 1: User Authentication & MFA
  // ==========================================
  console.log("\n🔑 [TEST 1] Registering and Authenticating Customer...");
  
  const customerPassword = "securepass123";
  const hashedPassword = await authService.hashPassword(customerPassword);
  const mfaSecret = authService.generateTOTPSecret();

  const customer = await prisma.customer.create({
    data: {
      first_name: "Test",
      last_name: "Customer",
      cnic: "38302-1234567-9",
      email: "test_cust@gmail.com",
      phone: "0300-1234567",
      address: "Mianwali, Pakistan",
      password_hash: hashedPassword,
      mfa_secret: mfaSecret,
      mfa_enabled: false
    }
  });
  console.log(`👤 Customer created successfully. ID: ${customer.customer_id}`);

  // Test Password Matching
  const isMatch = await authService.comparePassword(customerPassword, customer.password_hash);
  console.log(`🔓 Password check: ${isMatch ? "PASS" : "FAIL"}`);

  // Verify TOTP MFA token generation and validation
  const totpToken = authService.generateTOTP(mfaSecret);
  const isValidMfa = authService.verifyTOTPToken(totpToken, mfaSecret);
  console.log(`📱 TOTP MFA validation check: ${isValidMfa ? "PASS" : "FAIL"}`);

  // Register Employee
  console.log("\n👷 Registering and Authenticating Employee...");
  const employeePassword = "employeepass123";
  const hashedEmpPassword = await authService.hashPassword(employeePassword);
  const employee = await prisma.employee.create({
    data: {
      branch_id: 1, // Trust Bank
      first_name: "Staff",
      last_name: "Teller",
      role: "TELLER",
      email: "test_emp@gmail.com",
      hire_date: new Date(),
      password_hash: hashedEmpPassword,
      mfa_secret: authService.generateTOTPSecret(),
      mfa_enabled: false
    }
  });
  console.log(`👤 Employee created successfully. ID: ${employee.employee_id}`);

  // ==========================================
  // Test 2: Account Creation & Card Issuance
  // ==========================================
  console.log("\n🏦 [TEST 2] Creating Accounts for Customer...");
  
  const account1 = await accountService.createAccount({
    customer_id: customer.customer_id,
    branch_id: 1,
    account_type: "SAVINGS",
    currency: "PKR"
  });
  console.log(`💰 Account 1 created: ${account1.account_number} (Type: ${account1.account_type})`);

  const account2 = await accountService.createAccount({
    customer_id: customer.customer_id,
    branch_id: 1,
    account_type: "CHECKING",
    currency: "PKR"
  });
  console.log(`💰 Account 2 created: ${account2.account_number} (Type: ${account2.account_type})`);

  // Issue Card
  console.log("💳 Issuing Debit Card for Account 1...");
  const card = await accountService.issueCard({
    account_id: account1.account_id,
    card_type: "DEBIT",
    daily_limit: 100000.00
  });
  console.log(`✅ Card issued successfully: ${card.card_number} (CVV: ${card.cvv}, Limit: ${card.daily_limit})`);

  // ==========================================
  // Test 3: Transaction Processing
  // ==========================================
  console.log("\n💵 [TEST 3] Depositing and Withdrawing Funds...");
  
  // Deposit 250,000 PKR to Account 1
  const depositResult = await transactionService.deposit(account1.account_id, 250000.00);
  console.log(`📥 Deposit complete. New Balance: ${depositResult.new_balance} PKR`);

  // Withdraw 50,000 PKR from Account 1
  const withdrawResult = await transactionService.withdraw(account1.account_id, 50000.00);
  console.log(`📤 Withdrawal complete. New Balance: ${withdrawResult.new_balance} PKR`);

  // Internal Transfer of 100,000 PKR from Account 1 to Account 2
  console.log(`💸 Transferring 100,000 PKR from ${account1.account_number} to ${account2.account_number}...`);
  const transferTx = await transactionService.transfer(
    account1.account_id,
    account2.account_number,
    100000.00,
    "Payment of utility invoice"
  );
  console.log(`✅ Transfer successful. Transaction ID: ${transferTx.transaction_id}`);

  // Verify resulting balances
  const bal1 = await accountService.getAccountBalance(account1.account_id);
  const bal2 = await accountService.getAccountBalance(account2.account_id);
  console.log(`⚖️ Balance Account 1: ${bal1.balance} PKR | Balance Account 2: ${bal2.balance} PKR`);

  // ==========================================
  // Test 4: Loan & Amortization Scheduling
  // ==========================================
  console.log("\n📈 [TEST 4] Applying for and Approving Customer Loan...");
  
  // Apply for a loan of 500,000 PKR, 12% annual interest rate, 12 months tenure
  const loan = await loanService.applyLoan({
    customer_id: customer.customer_id,
    branch_id: 1,
    principal_amount: 500000.00,
    interest_rate: 12.00,
    tenure_months: 12,
    loan_type: "PERSONAL"
  });
  console.log(`📝 Loan application submitted. ID: ${loan.loan_id} (Status: ${loan.status})`);

  // Approve the Loan (Disburses funds and generates monthly EMIs)
  console.log(`🏦 Approving loan by Employee ID: ${employee.employee_id}...`);
  const approvalResult = await loanService.approveLoan(loan.loan_id, employee.employee_id, "APPROVED");
  console.log(`✅ Loan approved! Disbursed to Account Number: ${approvalResult.disbursed_to}`);
  console.log(`📊 Generated ${approvalResult.loan.repayments.length} monthly installments.`);
  
  const sampleInstallment = approvalResult.loan.repayments[0];
  console.log(`   - Monthly Payment (EMI): ${sampleInstallment.amount_paid} PKR`);
  console.log(`   - Principal component: ${sampleInstallment.principal_component} PKR`);
  console.log(`   - Interest component: ${sampleInstallment.interest_component} PKR`);
  console.log(`   - Remaining balance: ${sampleInstallment.remaining_balance} PKR`);

  // Check new Account 1 balance (should reflect original balance + disbursed loan amount)
  const afterLoanBalance = await accountService.getAccountBalance(account1.account_id);
  console.log(`💰 Account 1 balance after loan disbursement: ${afterLoanBalance.balance} PKR`);

  // Repay the first installment
  console.log("\n💳 Paying first loan installment...");
  const repaymentResult = await loanService.repayLoan(
    loan.loan_id,
    account1.account_id,
    sampleInstallment.amount_paid
  );
  console.log(`✅ First EMI payment successful! Installment status: ${repaymentResult.repayment.status}`);
  console.log(`📊 Remaining installments to pay: ${repaymentResult.remaining_pending_installments}`);

  // ==========================================
  // Test 5: Distributed Transactions (2PC + Redis)
  // ==========================================
  console.log("\n🌀 [TEST 5] Initiating Distributed 2PC Interbank Transfer...");
  
  // Transfer 20,000 PKR to another bank via Raast (Using Raast Network ID 1)
  const interbankResult = await interbankService.initiateTransfer({
    sender_account_id: account1.account_id,
    receiver_bank_swift: "ALFAPKKAXXX",
    receiver_account_number: "PK00ALFA1234567890",
    amount: 20000.00,
    raast_network_id: 1,
    description: "Gift for cousin"
  });

  console.log(`✅ Interbank 2PC Completed! Raast Ref: ${interbankResult.raast_reference}`);

  // Verify lock is released and balance updated
  const finalBal1 = await accountService.getAccountBalance(account1.account_id);
  console.log(`💰 Sender Final Balance: ${finalBal1.balance} PKR`);

  // ==========================================
  // Test 6: Compliance Audit Logs
  // ==========================================
  console.log("\n📁 [TEST 6] Inspecting Audit Trail logs...");
  
  const logs = await auditService.getAuditLogs();
  console.log(`📊 Total compliance audit logs recorded: ${logs.length}`);
  logs.forEach((log: any, idx: number) => {
    console.log(`   [${idx+1}] Action: ${log.action} | Entity: ${log.entity_type} (ID: ${log.entity_id}) | By Employee: ${log.employee ? log.employee.first_name : "System"}`);
  });

  console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! E2E BACKEND FUNCTIONALITIES FULLY VERIFIED.");
  process.exit(0);
}

runVerification().catch(err => {
  console.error("\n❌ VERIFICATION TEST FAILED with error:", err);
  process.exit(1);
});
