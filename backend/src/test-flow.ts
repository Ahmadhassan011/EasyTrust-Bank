const prisma = require("./config/prisma");
const authService = require("./modules/auth/auth.service");
const customerService = require("./modules/customer/customer.service");
const accountService = require("./modules/account/account.service");
const transactionService = require("./modules/transaction/transaction.service");
const loanService = require("./modules/loan/loan.service");
const cardService = require("./modules/card/card.service");
const coordinatorService = require("./modules/coordinator/coordinator.service");
const reportsService = require("./modules/reports/reports.service");
const auditService = require("./modules/audit/audit.service");
const bcrypt = require("bcrypt");

async function runTests() {
  console.log("🚀 Starting Comprehensive EasyTrust Bank Integration Flow Test...");
  console.log("=================================================================\n");

  try {
    // -------------------------------------------------------------
    // Step 0: Clean Up Existing Data to Ensure a Pure Test State
    // -------------------------------------------------------------
    console.log("🧹 Step 0: Cleaning up existing database records...");
    await prisma.card.deleteMany();
    await prisma.loanRepayment.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.interbankTransfer.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.bank.deleteMany();
    await prisma.raastNetwork.deleteMany();
    await prisma.customer.deleteMany();
    console.log("✅ Database cleared.\n");

    // -------------------------------------------------------------
    // Step 1: Seed Core System Entities (Bank, Branch, Employee, Networks)
    // -------------------------------------------------------------
    console.log("🌱 Step 1: Seeding core system entities...");
    
    // 1.1 Local Bank
    const bank = await prisma.bank.create({
      data: {
        bank_name: "EasyTrust Bank",
        swift_code: "ABPAPKKA949",
        country: "Pakistan",
        headquarters: "Islamabad"
      }
    });
    console.log(`- Local Bank Created: ${bank.bank_name} (SWIFT: ${bank.swift_code})`);

    // 1.2 Branch
    const branch = await prisma.branch.create({
      data: {
        bank_id: bank.bank_id,
        branch_name: "Blue Area Branch",
        address: "Jinnah Avenue, Islamabad",
        city: "Islamabad",
        phone: "051-1234567"
      }
    });
    console.log(`- Branch Created: ${branch.branch_name} in ${branch.city}`);

    // 1.3 Employee (Manager)
    const password_hash = await bcrypt.hash("123456", 12);
    const employee = await prisma.employee.create({
      data: {
        branch_id: branch.branch_id,
        first_name: "Ahmad",
        last_name: "Hassan",
        role: "MANAGER",
        email: "ahmad@easytrust.com",
        hire_date: new Date(),
        password_hash,
        is_active: true
      }
    });
    console.log(`- Employee Created: ${employee.first_name} ${employee.last_name} (${employee.role})`);

    // 1.4 RAAST Network configuration
    const raast = await prisma.raastNetwork.create({
      data: {
        network_name: "RAAST Pakistan",
        api_endpoint: "https://api.raast.gov.pk/v1",
        auth_token_hash: "mock-token-secret-hash",
        is_active: true
      }
    });
    console.log(`- RAAST Network Profile Seeded: ${raast.network_name}`);

    // 1.5 External Receiver Bank
    const extBank = await prisma.bank.create({
      data: {
        bank_name: "Receiver Test Bank",
        swift_code: "RCVRBDKK123",
        country: "Pakistan",
        headquarters: "Karachi"
      }
    });
    console.log(`- External Bank Seeded: ${extBank.bank_name} (SWIFT: ${extBank.swift_code})\n`);

    // -------------------------------------------------------------
    // Step 2: Customer Registration & KYC Verification
    // -------------------------------------------------------------
    console.log("👤 Step 2: Registering customer and verifying KYC...");
    const regResult = await authService.registerCustomer({
      first_name: "Jane",
      last_name: "Doe",
      cnic: "3740512345678",
      email: "jane.doe@gmail.com",
      password: "password123",
      phone: "03001234567",
      address: "123 Street, Rawalpindi",
      dob: "1995-05-15"
    });
    const customer = regResult.customer;
    console.log(`- Customer Registered: ${customer.first_name} ${customer.last_name} (CNIC: ${customer.cnic})`);
    console.log(`- JWT Access Token Generated: ${regResult.accessToken.slice(0, 30)}...`);

    // Verify KYC status (required for opening accounts)
    const updatedCustomer = await customerService.updateCustomer(customer.customer_id, {
      kyc_status: "VERIFIED"
    });
    console.log(`- Customer KYC Status Updated to: ${updatedCustomer.kyc_status}\n`);

    // -------------------------------------------------------------
    // Step 3: Account Creation
    // -------------------------------------------------------------
    console.log("🏦 Step 3: Opening savings account...");
    const account = await accountService.createAccount({
      customer_id: customer.customer_id,
      branch_id: branch.branch_id,
      account_type: "SAVINGS",
      balance: 100000.00,
      daily_limit: 50000.00
    });
    console.log(`- Account Opened: #${account.account_number} (Initial Balance: PKR ${account.balance})\n`);

    // -------------------------------------------------------------
    // Step 4: Deposits & Withdrawals (Transactions)
    // -------------------------------------------------------------
    console.log("💰 Step 4: Executing transactions...");
    
    // 4.1 Deposit
    const depositTx = await transactionService.executeDeposit(
      account.account_id,
      15000.00,
      "Mobile App Transfer Deposit"
    );
    console.log(`- Deposit Completed: +PKR 15,000.00 (Tx ID: ${depositTx.transaction_id})`);

    // 4.2 Withdrawal
    const withdrawTx = await transactionService.executeWithdrawal(
      account.account_id,
      5000.00,
      "ATM Cash Withdrawal"
    );
    console.log(`- Withdrawal Completed: -PKR 5,000.00 (Tx ID: ${withdrawTx.transaction_id})`);

    // 4.3 Verify account balance
    const refreshedAccount = await accountService.getAccountById(account.account_id);
    console.log(`- Account Current Balance: PKR ${refreshedAccount.balance.toString()} (Expected: 110,000.00)\n`);

    // -------------------------------------------------------------
    // Step 5: Card Issuance & Management
    // -------------------------------------------------------------
    console.log("💳 Step 5: Issuing and managing card...");
    
    // 5.1 Issue card
    const card = await cardService.createCard({
      account_id: account.account_id,
      card_type: "DEBIT",
      daily_limit: 30000.00
    });
    console.log(`- Debit Card Issued: ${card.card_number}`);
    console.log(`- Expiry Date: ${card.expiry_date.toISOString().split('T')[0]}, CVV: ${card.cvv}`);

    // 5.2 Retrieve card details
    const retrievedCard = await cardService.getCardById(card.card_id);
    console.log(`- Retrieved Card Details: Card Status = ${retrievedCard.status}, Limit = PKR ${retrievedCard.daily_limit}`);

    // 5.3 Lock/Block Card
    const blockedCard = await cardService.updateCardStatus(card.card_id, "BLOCKED");
    console.log(`- Card Status Updated: ${blockedCard.status}`);

    // 5.4 Update Card Limit
    const updatedCard = await cardService.updateCardLimit(card.card_id, 20000.00);
    console.log(`- Card Daily Limit Updated: PKR ${updatedCard.daily_limit}\n`);

    // -------------------------------------------------------------
    // Step 6: Loan Application, Approval, and Repayment
    // -------------------------------------------------------------
    console.log("📄 Step 6: Requesting and managing loan...");
    
    // 6.1 Apply
    const loan = await loanService.applyForLoan({
      customer_id: customer.customer_id,
      branch_id: branch.branch_id,
      principal_amount: 50000.00,
      interest_rate: 12.00,
      tenure_months: 6,
      loan_type: "PERSONAL"
    });
    console.log(`- Loan Application Submitted: Principal = PKR ${loan.principal_amount}, Interest = ${loan.interest_rate}%, Status = ${loan.status}`);

    // 6.2 Approve (by Employee)
    const approvedLoan = await loanService.approveLoan(loan.loan_id, employee.employee_id);
    console.log(`- Loan Approved: Status = ${approvedLoan.status}, Approved By Employee ID = ${approvedLoan.approved_by}`);

    // 6.3 Loan Repayment
    const repayment = await loanService.makeRepayment(loan.loan_id, account.account_id, 10000.00);
    console.log(`- Loan Repayment Executed: Paid PKR ${repayment.amount_paid.toString()}, Remaining Loan Balance = PKR ${repayment.remaining_balance.toString()}\n`);

    // -------------------------------------------------------------
    // Step 7: 2PC Coordinator Interbank Transfer
    // -------------------------------------------------------------
    console.log("🔄 Step 7: Executing Two-Phase Commit (2PC) Interbank Transfer...");
    
    const before2pcAccount = await accountService.getAccountById(account.account_id);
    console.log(`- Sender balance before 2PC: PKR ${before2pcAccount.balance.toString()}`);

    const coordinatorResult = await coordinatorService.executeTwoPhaseCommit({
      sender_account_id: account.account_id,
      receiver_bank_swift: extBank.swift_code,
      receiver_account_number: "PK99RCVR123456789",
      amount: 15000.00,
      raast_network_id: raast.raast_id,
      description: "2PC Coordinator testing transfer"
    });
    
    console.log(`- 2PC Flow completed: Status = ${coordinatorResult.success ? 'Success' : 'Fail'}`);
    console.log(`- RAAST Reference: ${coordinatorResult.raast_reference}`);

    const after2pcAccount = await accountService.getAccountById(account.account_id);
    console.log(`- Sender balance after 2PC: PKR ${after2pcAccount.balance.toString()} (Expected: 85,000.00)\n`);

    // -------------------------------------------------------------
    // Step 8: Reports & Auditing
    // -------------------------------------------------------------
    console.log("📊 Step 8: Generating reports and retrieving audit logs...");
    
    // 8.1 Monthly transaction summary
    const report = await reportsService.getMonthlyTransactions();
    console.log(`- Monthly Report Generated: Total Transactions = ${report.totalTransactions}`);
    console.log("- Transaction Types Count:");
    report.summary.forEach((s: any) => {
      console.log(`  * ${s.type} (${s.status}): Count = ${s._count.transaction_id}, Sum = PKR ${s._sum.amount}`);
    });

    // 8.2 Audit log
    const auditLogs = await auditService.getLogs({});
    console.log(`- Audit Log Trail: Total Actions Logged = ${auditLogs.total}`);
    console.log("- Recent Audit Actions:");
    auditLogs.logs.slice(0, 5).forEach((log: any) => {
      console.log(`  * Action: [${log.action}] on Entity: [${log.entity_type}] (ID: ${log.entity_id}) at ${log.logged_at.toISOString()}`);
    });

    console.log("\n=================================================================");
    console.log("🎉 ALL INTEGRATION FLOW TESTS COMPLETED SUCCESSFULY!");
    console.log("=================================================================");

  } catch (error: any) {
    console.error("\n❌ Test Execution Failed!");
    console.error("Error Message:", error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    // Disconnect Prisma
    await prisma.$disconnect();
  }
}

runTests();
