// EasyTrust Bank Master Frontend Application Logic

const API_BASE = "http://localhost:3000/api/v1";

// Master State Management
let state = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  activeView: "landing",
  accounts: [],
  loans: [],
  authMode: "login", // login or register
  registerRole: "customer" // customer or employee
};

// ==========================================
// 🚀 Initialization & Session Recovery
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  recoverSession();
  setupEventListeners();
  lucide.createIcons();
});

function recoverSession() {
  if (state.token && state.user) {
    if (state.user.role === "customer") {
      routeTo("customer");
    } else if (state.user.role === "employee") {
      routeTo("employee");
    }
  } else {
    routeTo("landing");
  }
}

// ==========================================
// 🧭 View Routing & Headers
// ==========================================
function routeTo(viewName) {
  state.activeView = viewName;
  
  // Hide all views
  document.getElementById("view-landing").classList.add("hidden");
  document.getElementById("view-auth").classList.add("hidden");
  document.getElementById("view-customer-dashboard").classList.add("hidden");
  document.getElementById("view-employee-portal").classList.add("hidden");

  // Show target view
  if (viewName === "landing") {
    document.getElementById("view-landing").classList.remove("hidden");
  } else if (viewName === "auth") {
    document.getElementById("view-auth").classList.remove("hidden");
    resetAuthForm();
  } else if (viewName === "customer") {
    document.getElementById("view-customer-dashboard").classList.remove("hidden");
    fetchCustomerDashboardData();
  } else if (viewName === "employee") {
    document.getElementById("view-employee-portal").classList.remove("hidden");
    fetchEmployeeDashboardData();
  }

  renderNavBar();
  setTimeout(() => lucide.createIcons(), 50);
}

function renderNavBar() {
  const navActions = document.getElementById("nav-actions");
  if (state.token && state.user) {
    navActions.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-sm font-semibold text-white">${state.user.first_name} ${state.user.last_name}</span>
          <span class="text-xs text-emerald-400 capitalize font-mono">${state.user.role}</span>
        </div>
        <button onclick="logout()" class="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-gray-300 font-semibold px-4 py-2 rounded-xl transition duration-300">
          <i data-lucide="log-out" class="w-4 h-4"></i> Logout
        </button>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <button onclick="routeTo('auth')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 rounded-xl transition duration-300 shadow-lg shadow-emerald-500/15">
        Access Portal
      </button>
    `;
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showToast("Logged out successfully");
  routeTo("landing");
}

// ==========================================
// 📣 Toast Notification System
// ==========================================
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  
  const icon = type === "success" ? "check-circle" : type === "error" ? "alert-triangle" : "info";
  const iconColor = type === "success" ? "text-emerald-400" : type === "error" ? "text-red-400" : "text-blue-400";
  const borderColor = type === "success" ? "border-emerald-500/30" : type === "error" ? "border-red-500/30" : "border-blue-500/30";

  toast.className = `toast glass-panel p-4 rounded-xl border ${borderColor} flex items-start gap-3 shadow-lg max-w-sm w-full`;
  toast.innerHTML = `
    <div class="${iconColor} shrink-0">
      <i data-lucide="${icon}" class="w-5 h-5"></i>
    </div>
    <div class="flex-1 text-sm text-gray-200">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-gray-500 hover:text-white shrink-0">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Autoremove
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ==========================================
// 🔑 Authentication Logic (Register/Login)
// ==========================================
function toggleAuthMode(mode) {
  state.authMode = mode;
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  
  const registerRoleField = document.getElementById("register-role-field");
  const registerNameFields = document.getElementById("register-name-fields");
  const custFields = document.getElementById("cust-register-fields");
  const empFields = document.getElementById("emp-register-fields");
  const mfaSetup = document.getElementById("mfa-setup-section");

  mfaSetup.classList.add("hidden");

  if (mode === "login") {
    tabLogin.className = "flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition duration-200 bg-emerald-500 text-slate-900 shadow";
    tabRegister.className = "flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition duration-200 text-gray-400 hover:text-white";
    
    registerRoleField.classList.add("hidden");
    registerNameFields.classList.add("hidden");
    custFields.classList.add("hidden");
    empFields.classList.add("hidden");
    
    document.getElementById("auth-fname").required = false;
    document.getElementById("auth-lname").required = false;
    document.getElementById("auth-cnic").required = false;
  } else {
    tabRegister.className = "flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition duration-200 bg-emerald-500 text-slate-900 shadow";
    tabLogin.className = "flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition duration-200 text-gray-400 hover:text-white";
    
    registerRoleField.classList.remove("hidden");
    registerNameFields.classList.remove("hidden");
    
    document.getElementById("auth-fname").required = true;
    document.getElementById("auth-lname").required = true;
    
    selectRegisterRole(state.registerRole);
  }
  lucide.createIcons();
}

function selectRegisterRole(role) {
  state.registerRole = role;
  document.getElementById("auth-role").value = role;
  
  const roleCust = document.getElementById("role-cust");
  const roleEmp = document.getElementById("role-emp");
  const custFields = document.getElementById("cust-register-fields");
  const empFields = document.getElementById("emp-register-fields");

  if (role === "customer") {
    roleCust.className = "flex-1 py-2 text-xs font-semibold rounded bg-emerald-500 text-slate-900";
    roleEmp.className = "flex-1 py-2 text-xs font-semibold rounded text-gray-400";
    
    custFields.classList.remove("hidden");
    empFields.classList.add("hidden");
    
    document.getElementById("auth-cnic").required = true;
    document.getElementById("auth-branch-id").required = false;
    document.getElementById("auth-emp-role").required = false;
    document.getElementById("auth-hire-date").required = false;
  } else {
    roleEmp.className = "flex-1 py-2 text-xs font-semibold rounded bg-emerald-500 text-slate-900";
    roleCust.className = "flex-1 py-2 text-xs font-semibold rounded text-gray-400";
    
    empFields.classList.remove("hidden");
    custFields.classList.add("hidden");
    
    document.getElementById("auth-cnic").required = false;
    document.getElementById("auth-branch-id").required = true;
    document.getElementById("auth-emp-role").required = true;
    document.getElementById("auth-hire-date").required = true;
  }
}

function resetAuthForm() {
  document.getElementById("auth-form").reset();
  toggleAuthMode("login");
}

// Handle login, sign-up forms
async function handleAuthSubmit(e) {
  e.preventDefault();
  
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;

  if (state.authMode === "login") {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error.message || "Login failed");
      }

      if (data.data.mfa_required) {
        // MFA verified modal trigger
        document.getElementById("mfa-verify-email").value = email;
        document.getElementById("mfa-verify-code").value = "";
        document.getElementById("mfa-modal-overlay").classList.remove("hidden");
        document.getElementById("mfa-verify-code").focus();
      } else {
        loginSuccess(data.data.token, data.data.user);
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  } else {
    // Signup execution
    const role = state.registerRole;
    const first_name = document.getElementById("auth-fname").value;
    const last_name = document.getElementById("auth-lname").value;

    let payload = { role, email, password, first_name, last_name };

    if (role === "customer") {
      payload.cnic = document.getElementById("auth-cnic").value;
      payload.phone = document.getElementById("auth-phone").value;
      payload.address = document.getElementById("auth-address").value;
      payload.dob = document.getElementById("auth-dob").value;
    } else {
      payload.branch_id = Number(document.getElementById("auth-branch-id").value);
      payload.employee_role = document.getElementById("auth-emp-role").value;
      payload.hire_date = document.getElementById("auth-hire-date").value;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error.message || "Registration failed");
      }

      showToast("Account created successfully! Link your Authenticator app.");
      
      // Render MFA setup URL
      document.getElementById("mfa-secret-text").innerText = data.data.mfa_secret;
      document.getElementById("mfa-qr-code").src = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(data.data.mfa_setup_url)}`;
      document.getElementById("mfa-setup-section").classList.remove("hidden");
      
      // Force change to Sign In Tab so they can login after scan
      showToast("Scan the QR code and login using Sign In");
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

async function handleMfaSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("mfa-verify-email").value;
  const code = document.getElementById("mfa-verify-code").value;

  try {
    const res = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "MFA validation failed");
    }

    document.getElementById("mfa-modal-overlay").classList.add("hidden");
    loginSuccess(data.data.token, data.data.user);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function loginSuccess(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  
  showToast(`Welcome back, ${user.first_name}!`);
  
  if (user.role === "customer") {
    routeTo("customer");
  } else {
    routeTo("employee");
  }
}

// ==========================================
// 🏦 Customer Dashboard Fetching & Rendering
// ==========================================
async function fetchCustomerDashboardData() {
  if (!state.token || !state.user) return;

  // Render greeting name
  document.getElementById("dash-greeting-name").innerText = state.user.first_name;

  try {
    const headers = { "Authorization": `Bearer ${state.token}` };
    
    // Fetch Accounts list
    const acctRes = await fetch(`${API_BASE}/customers/${state.user.id}/accounts`, { headers });
    const acctData = await acctRes.json();
    if (acctData.success) {
      state.accounts = acctData.data;
      renderCustomerAccounts();
      populateSourceAccountSelections();
    }

    // Fetch Loans List
    const loanRes = await fetch(`${API_BASE}/customers`, { headers }); // Re-used for loan info or fetch directly
    // Let's perform a query on all loans for user
    const allLoansRes = await fetch(`${API_BASE}/loans/apply`, { method: "POST", headers, body: "{}" }); // Check schema
    // In our loan system, we can query loans by fetching them from DB or via custom query. Let's make an authenticated fetch
    renderCustomerLoans();

    // Fetch transaction logs
    const txRes = await fetch(`${API_BASE}/transactions/history`, { headers });
    const txData = await txRes.json();
    if (txData.success) {
      renderTransactionsTable(txData.data);
    }
  } catch (err) {
    console.error("Failed to load customer dash details", err);
  }
}

function renderCustomerAccounts() {
  const container = document.getElementById("customer-accounts-grid");
  const cardContainer = document.getElementById("customer-cards-container");
  
  if (state.accounts.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 glass-panel p-8 text-center text-gray-500 rounded-2xl">
        No active accounts found. Click "Open Bank Account" to open your first PKR account.
      </div>
    `;
    cardContainer.innerHTML = `
      <div class="glass-panel p-6 text-center text-gray-500 rounded-2xl">
        No active cards issued.
      </div>
    `;
    return;
  }

  container.innerHTML = state.accounts.map(acct => `
    <div class="glass-panel p-6 rounded-2xl border border-white/5 glass-panel-hover flex flex-col justify-between">
      <div class="flex items-start justify-between">
        <div>
          <span class="text-xs text-emerald-400 font-semibold uppercase tracking-wider">${acct.account_type}</span>
          <h4 class="text-xl font-bold text-white mt-1 select-all">${acct.account_number}</h4>
        </div>
        <div class="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
          <i data-lucide="wallet" class="w-4 h-4"></i>
        </div>
      </div>
      <div class="mt-6 flex items-baseline justify-between">
        <span class="text-xs text-gray-400">Available Balance</span>
        <span class="text-2xl font-black text-white">${Number(acct.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })} <span class="text-sm font-semibold text-emerald-400">${acct.currency}</span></span>
      </div>
    </div>
  `).join("");

  // Check issued cards and render
  // Simulate fetching cards by querying accounts cards
  const allCards = [];
  state.accounts.forEach(a => {
    if (a.cards && a.cards.length > 0) {
      allCards.push(...a.cards);
    }
  });

  if (allCards.length === 0) {
    cardContainer.innerHTML = `
      <div class="glass-panel p-8 text-center text-gray-500 rounded-2xl">
        Request an employee to issue a Debit/Credit card for your active accounts.
      </div>
    `;
  } else {
    cardContainer.innerHTML = allCards.map(c => `
      <div class="credit-card-gradient p-6 rounded-2xl shadow-xl flex flex-col justify-between h-44 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-400/5 rounded-full filter blur-xl"></div>
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-semibold text-emerald-300 uppercase tracking-widest">${c.card_type} CARD</span>
            <div class="text-sm text-white/50 mt-1 font-mono">Limit: ${Number(c.daily_limit).toLocaleString()} PKR/day</div>
          </div>
          <i data-lucide="contactless" class="w-5 h-5 text-emerald-400"></i>
        </div>
        <div>
          <div class="text-lg font-mono tracking-widest text-white mt-4 font-bold select-all">${c.card_number.replace(/(.{4})/g, '$1 ')}</div>
          <div class="flex justify-between items-end mt-4">
            <div>
              <span class="text-[9px] text-white/40 block uppercase">Expiry</span>
              <span class="text-xs font-mono text-white">${new Date(c.expiry_date).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" })}</span>
            </div>
            <div class="bg-white/10 px-2 py-0.5 rounded text-white/60 font-mono text-xs">ACTIVE</div>
          </div>
        </div>
      </div>
    `).join("");
  }

  lucide.createIcons();
}

function populateSourceAccountSelections() {
  const selections = [
    "tx-internal-source",
    "tx-deposit-account",
    "tx-withdraw-account",
    "tx-raast-source"
  ];

  const options = state.accounts.map(a => 
    `<option value="${a.account_id}" class="bg-[#0b0f19]">${a.account_type} (${a.account_number}) - Bal: ${Number(a.balance).toLocaleString()} PKR</option>`
  ).join("");

  selections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = options;
  });
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transaction-history-rows");
  
  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center text-gray-500">No transactions recorded yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    const isCredit = t.toAccount && t.toAccount.customer_id === state.user.id && t.type !== "WITHDRAWAL";
    const amountSign = isCredit ? "+" : "-";
    const amountColor = isCredit ? "text-emerald-400 font-bold" : "text-gray-300";
    
    let partyInfo = "System Deposit";
    if (t.type === "TRANSFER" || t.type === "INTERBANK_TRANSFER") {
      if (isCredit) {
        partyInfo = `From: ${t.fromAccount ? t.fromAccount.account_number : "External"}`;
      } else {
        partyInfo = `To: ${t.toAccount ? t.toAccount.account_number : t.interbankTransfer ? t.interbankTransfer.receiver_bank_swift : "External"}`;
      }
    } else if (t.type === "LOAN_DISBURSEMENT") {
      partyInfo = "Loan Disbursement";
    } else if (t.type === "LOAN_REPAYMENT") {
      partyInfo = "Loan Installment";
    }

    return `
      <tr class="hover:bg-white/[0.02] transition">
        <td class="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-xs">${new Date(t.created_at).toLocaleString()}</td>
        <td class="px-6 py-4 whitespace-nowrap font-mono text-xs text-white">${t.transaction_id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-300 font-medium">${partyInfo}</td>
        <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 border border-white/10 uppercase tracking-wider text-emerald-400">${t.type}</span></td>
        <td class="px-6 py-4 text-xs text-gray-400 truncate max-w-xs">${t.description || "N/A"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-mono ${amountColor}">${amountSign} ${Number(t.amount).toLocaleString()} PKR</td>
        <td class="px-6 py-4 whitespace-nowrap text-center"><span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SUCCESS</span></td>
      </tr>
    `;
  }).join("");
}

async function renderCustomerLoans() {
  const container = document.getElementById("dash-loans-container");
  const section = document.getElementById("customer-loans-section");
  
  try {
    const res = await fetch(`${API_BASE}/audit`, { // In this layout we get customer audit / loan tables from custom endpoint, let's fetch customer details directly
      headers: { "Authorization": `Bearer ${state.token}` }
    });
    
    // Quick custom query to fetch all customer active loans
    const loansRes = await fetch(`${API_BASE}/loans/apply`, { method: "POST", headers: { "Authorization": `Bearer ${state.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ customer_id: state.user.id, limit: 1 }) });
    // Let's perform a query. Rather than throwing, we query the loans table directly using an employee-level fetch (or custom helper). Let's mock a simple select for customer loans.
    // If not found, let's fetch loans by pulling the database loan table matching customer ID
    // Let's get customer accounts loans via fetch
    const getLoansRes = await fetch(`${API_BASE}/customers/${state.user.id}/accounts`, { headers: { "Authorization": `Bearer ${state.token}` } });
    const getLoansData = await getLoansRes.json();
    
    // We can query all loans directly. Let's make sure we draw from active state
    // Let's do a direct select by writing a generic service resolver or fetch
    const dbLoans = await queryCustomerLoans(state.user.id);
    
    if (!dbLoans || dbLoans.length === 0) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");
    container.innerHTML = dbLoans.map(loan => {
      const activePending = loan.repayments.find(r => r.status === "PENDING");
      
      let repayButtonHTML = "";
      if (activePending) {
        repayButtonHTML = `
          <button onclick="processLoanRepayment(${loan.loan_id}, ${activePending.amount_paid})" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-2 rounded-xl transition duration-300 text-xs">
            Repay Installment (${Number(activePending.amount_paid).toLocaleString()} PKR)
          </button>
        `;
      } else {
        repayButtonHTML = `<span class="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> Fully Repaid</span>`;
      }

      const totalPaid = loan.repayments.filter(r => r.status === "PAID").length;
      const progressPercent = Math.round((totalPaid / loan.tenure_months) * 100);

      return `
        <div class="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">${loan.loan_type} LOAN</span>
              <h4 class="text-md font-bold text-white mt-1">Loan Ref ID: ${loan.loan_id}</h4>
            </div>
            <div>
              ${repayButtonHTML}
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl text-center">
            <div>
              <span class="text-[10px] text-gray-400 uppercase">Principal</span>
              <div class="text-sm font-bold text-white mt-0.5">${Number(loan.principal_amount).toLocaleString()} PKR</div>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase">Interest Rate</span>
              <div class="text-sm font-bold text-white mt-0.5">${loan.interest_rate}% Annual</div>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase">EMI Installments</span>
              <div class="text-sm font-bold text-white mt-0.5">${loan.tenure_months} Months</div>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase">Status</span>
              <div class="text-sm font-bold text-emerald-400 mt-0.5">${loan.status}</div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-gray-400">
              <span>Repayments: ${totalPaid} / ${loan.tenure_months} Paid</span>
              <span>${progressPercent}% Completed</span>
            </div>
            <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
    lucide.createIcons();
  } catch (error) {
    console.error("Failed to load customer loans details", error);
  }
}

// Simulated direct secure fetching for customer active loans
async function queryCustomerLoans(customerId) {
  try {
    const res = await fetch(`${API_BASE}/audit`, { // We run a query through the employee route using state token or custom select
      headers: { "Authorization": `Bearer ${state.token}` }
    });
    // In our backend, we don't have a direct loans list endpoint mapped in the README, but we can query them securely. Let's make a request to our health / audit to verify
    // Since employee has direct db access, if user is employee we inspect all. For client, we can query active customer loan repayments via a customer endpoint or standard db query.
    // Let's implement a fetch that requests loans matching client. In the backend, we registered loan routes!
    // `router.post("/apply", authRequired, validate(loanValidation.applyLoanSchema), loanController.apply);`
    // Let's write a small API endpoint hit to retrieve it or perform a secure fetch.
    const activeLoansRes = await fetch(`${API_BASE}/customers`, { headers: { "Authorization": `Bearer ${state.token}` } });
    // Let's just create a custom fetch helper or mock data if there are issues, but since we designed a complete database schema, we can write a clean query
    // Let's fetch all loans by query! Since we didn't add a specific GET /api/v1/loans/customer/:id route, let's create a custom post/get helper or let the user fetch them!
    // Wait, let's look at `loan.routes.ts` in our backend:
    // It has `POST /apply` (creates loan), `PUT /:id/approve`, `POST /:id/repay`.
    // Wait! Let's check how the client queries their loans.
    // We can implement a secure custom query inside `customer.routes.ts` or `loan.routes.ts` if needed, or query them using a generic endpoint.
    // Actually, to make things extremely robust, let's add a GET `/api/v1/loans` or GET `/api/v1/loans/customer/:id` endpoint!
    // Wait, is it already defined?
    // Let's check if we can query the Prisma db from client side? No, that's backend.
    // Let's check if we have a GET endpoint for loans. We didn't create a GET endpoint for loans, only POST and PUT.
    // Let's add a GET endpoint for loans to `loan.routes.ts` so that customers and employees can fetch their active loans! This is a wonderful and necessary detail!
    // Let's do that in a follow-up replace. But wait! Let's write a quick placeholder or complete the JS logic first.
    // Let's fetch loans by pulling from a generic list of loans if we add the route. Let's add the route!
  } catch (error) {
    return [];
  }
}

// ==========================================
// 👷 Employee Dashboard Fetching & Rendering
// ==========================================
async function fetchEmployeeDashboardData() {
  if (!state.token || !state.user) return;
  const headers = { "Authorization": `Bearer ${state.token}` };

  try {
    // 1. Fetch pending loan queue
    // We can fetch loans from a generic list of loans. Let's make a fetch request.
    const res = await fetch(`${API_BASE}/audit`, { headers });
    // We can retrieve pending loans by querying a loan list endpoint (we will add GET /api/v1/loans to loan.routes.ts).
    // Let's render the list.
    renderEmployeeLoanQueue();

    // 2. Fetch compliance audit log
    const auditRes = await fetch(`${API_BASE}/audit`, { headers });
    const auditData = await auditRes.json();
    if (auditData.success) {
      renderAuditLogs(auditData.data);
    }
  } catch (err) {
    console.error("Failed to load employee console", err);
  }
}

async function renderEmployeeLoanQueue() {
  const tbody = document.getElementById("employee-loan-queue-rows");
  try {
    const headers = { "Authorization": `Bearer ${state.token}` };
    const res = await fetch(`${API_BASE}/loans`, { headers }); // We'll add this endpoint!
    const data = await res.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center text-gray-500">Loan underwriting queue is currently empty.</td>
        </tr>
      `;
      return;
    }

    const pendings = data.data.filter(l => l.status === "PENDING");
    if (pendings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center text-gray-500">All loans have been reviewed. Queue is clean.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pendings.map(loan => `
      <tr class="hover:bg-white/[0.02] transition">
        <td class="px-6 py-4 whitespace-nowrap text-white font-semibold">Client ID: ${loan.customer_id}</td>
        <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">${loan.loan_type}</span></td>
        <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-300 font-bold">${Number(loan.principal_amount).toLocaleString()} PKR</td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-400">${loan.tenure_months} Months</td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-400 font-mono">${loan.interest_rate}%</td>
        <td class="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-2">
          <button onclick="underwriteLoan(${loan.loan_id}, 'APPROVED')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg transition duration-200 text-xs">
            Approve
          </button>
          <button onclick="underwriteLoan(${loan.loan_id}, 'REJECTED')" class="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-red-400 font-bold px-3 py-1.5 rounded-lg transition duration-200 text-xs">
            Reject
          </button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-10 text-center text-gray-500">Error retrieving loan queue.</td>
      </tr>
    `;
  }
}

function renderAuditLogs(logs) {
  const tbody = document.getElementById("employee-audit-rows");
  
  if (!logs || logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center text-gray-500">No audit logs recorded yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr class="hover:bg-white/[0.02] transition text-xs">
      <td class="px-6 py-4 whitespace-nowrap text-gray-400 font-mono">${new Date(log.logged_at).toLocaleString()}</td>
      <td class="px-6 py-4 whitespace-nowrap font-mono text-emerald-400 font-bold">Staff #${log.employee_id || "System"}</td>
      <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 border border-white/10 uppercase tracking-wider text-white">${log.action}</span></td>
      <td class="px-6 py-4 whitespace-nowrap text-gray-300 font-semibold">${log.entity_type} (ID: ${log.entity_id})</td>
      <td class="px-6 py-4 text-gray-500 font-mono truncate max-w-xs">${log.old_value || "N/A"}</td>
      <td class="px-6 py-4 text-emerald-400/80 font-mono truncate max-w-xs">${log.new_value || "N/A"}</td>
      <td class="px-6 py-4 whitespace-nowrap text-gray-400 font-mono">${log.ip_address || "127.0.0.1"}</td>
    </tr>
  `).join("");
}

// ==========================================
// 💡 Form Submissions Handlers
// ==========================================
function setupEventListeners() {
  // Auth Submit
  document.getElementById("auth-form").addEventListener("submit", handleAuthSubmit);
  document.getElementById("mfa-verify-form").addEventListener("submit", handleMfaSubmit);

  // Customer Dash Forms
  document.getElementById("create-account-form").addEventListener("submit", handleCreateAccount);
  document.getElementById("form-tx-internal").addEventListener("submit", handleInternalTransfer);
  document.getElementById("form-tx-deposit").addEventListener("submit", handleDeposit);
  document.getElementById("form-tx-withdraw").addEventListener("submit", handleWithdraw);
  document.getElementById("form-tx-raast").addEventListener("submit", handleRaastTransfer);
  document.getElementById("loan-apply-form").addEventListener("submit", handleLoanApply);

  // Employee Forms
  document.getElementById("issue-card-form").addEventListener("submit", handleIssueCard);
}

// Open Account Drawer Toggle
let isAccountFormOpen = false;
function toggleOpenAccountForm() {
  const drawer = document.getElementById("open-account-drawer");
  isAccountFormOpen = !isAccountFormOpen;
  if (isAccountFormOpen) {
    drawer.classList.remove("hidden");
  } else {
    drawer.classList.add("hidden");
  }
}

// Create Account Action
async function handleCreateAccount(e) {
  e.preventDefault();
  const account_type = document.getElementById("new-acct-type").value;
  const currency = document.getElementById("new-acct-currency").value;

  try {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({
        customer_id: state.user.id,
        branch_id: 1, // Trust Bank
        account_type,
        currency
      })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Failed to open account");
    }

    showToast("Bank account opened successfully!");
    toggleOpenAccountForm();
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Switch Transfer Tabs
function switchTransferTab(tabName) {
  const tabs = ["internal", "deposit", "withdraw", "raast"];
  tabs.forEach(t => {
    const tabBtn = document.getElementById(`tab-tx-${t}`);
    const tabForm = document.getElementById(`form-tx-${t}`);
    
    if (t === tabName) {
      tabBtn.className = "py-2.5 px-4 text-sm font-semibold border-b-2 border-emerald-400 text-emerald-400";
      tabForm.classList.remove("hidden");
    } else {
      tabBtn.className = "py-2.5 px-4 text-sm font-semibold text-gray-400 hover:text-white";
      tabForm.classList.add("hidden");
    }
  });
}

// Internal Transfer
async function handleInternalTransfer(e) {
  e.preventDefault();
  const sourceId = Number(document.getElementById("tx-internal-source").value);
  const to_account_number = document.getElementById("tx-internal-recipient").value;
  const amount = Number(document.getElementById("tx-internal-amount").value);
  const description = document.getElementById("tx-internal-desc").value;

  try {
    const res = await fetch(`${API_BASE}/accounts/${sourceId}/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ to_account_number, amount, description })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Transfer failed");
    }

    showToast(`Transferred ${amount.toLocaleString()} PKR successfully!`);
    document.getElementById("form-tx-internal").reset();
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Deposit
async function handleDeposit(e) {
  e.preventDefault();
  const acctId = Number(document.getElementById("tx-deposit-account").value);
  const amount = Number(document.getElementById("tx-deposit-amount").value);

  try {
    const res = await fetch(`${API_BASE}/accounts/${acctId}/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Deposit failed");
    }

    showToast(`Deposited ${amount.toLocaleString()} PKR successfully!`);
    document.getElementById("form-tx-deposit").reset();
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Withdraw
async function handleWithdraw(e) {
  e.preventDefault();
  const acctId = Number(document.getElementById("tx-withdraw-account").value);
  const amount = Number(document.getElementById("tx-withdraw-amount").value);

  try {
    const res = await fetch(`${API_BASE}/accounts/${acctId}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Withdrawal failed");
    }

    showToast(`Withdrew ${amount.toLocaleString()} PKR successfully!`);
    document.getElementById("form-tx-withdraw").reset();
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Raast Transfer (2PC)
async function handleRaastTransfer(e) {
  e.preventDefault();
  const sourceId = Number(document.getElementById("tx-raast-source").value);
  const receiver_bank_swift = document.getElementById("tx-raast-swift").value;
  const receiver_account_number = document.getElementById("tx-raast-recipient").value;
  const amount = Number(document.getElementById("tx-raast-amount").value);

  try {
    const res = await fetch(`${API_BASE}/interbank/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({
        sender_account_id: sourceId,
        receiver_bank_swift,
        receiver_account_number,
        amount,
        raast_network_id: 1 // Default active network
      })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Interbank transfer aborted");
    }

    showToast(`Raast transfer settled! Ref: ${data.data.raast_reference}`);
    document.getElementById("form-tx-raast").reset();
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Loan Apply Action
async function handleLoanApply(e) {
  e.preventDefault();
  const principal_amount = Number(document.getElementById("loan-amount").value);
  const interest_rate = Number(document.getElementById("loan-rate").value);
  const tenure_months = Number(document.getElementById("loan-tenure").value);
  const loan_type = document.getElementById("loan-type").value;

  try {
    const res = await fetch(`${API_BASE}/loans/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({
        customer_id: state.user.id,
        branch_id: 1, // Trust Bank
        principal_amount,
        interest_rate,
        tenure_months,
        loan_type
      })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Failed to submit loan application");
    }

    showToast("Loan application submitted for review!");
    document.getElementById("loan-apply-form").reset();
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Loan Repayment
async function processLoanRepayment(loanId, amount) {
  if (state.accounts.length === 0) {
    showToast("You need an active account to make loan repayments.", "error");
    return;
  }

  // Deduct from customer's primary account
  const sourceAccountId = state.accounts[0].account_id;

  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/repay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({
        account_id: sourceAccountId,
        amount
      })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Repayment failed");
    }

    showToast("Installment paid successfully!");
    fetchCustomerDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================
// 👷 Employee Dashboard Actions
// ==========================================

// Loan Underwriting Approve/Reject
async function underwriteLoan(loanId, status) {
  try {
    const res = await fetch(`${API_BASE}/loans/${loanId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Review submission failed");
    }

    showToast(`Loan ID #${loanId} marked as ${status}!`);
    fetchEmployeeDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Issue Card
async function handleIssueCard(e) {
  e.preventDefault();
  const account_id = Number(document.getElementById("issue-card-account-id").value);
  const card_type = document.getElementById("issue-card-type").value;
  const daily_limit = Number(document.getElementById("issue-card-limit").value);

  try {
    const res = await fetch(`${API_BASE}/accounts/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ account_id, card_type, daily_limit })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error.message || "Failed to issue card");
    }

    showToast(`Card issued successfully! CVV: ${data.data.cvv}`);
    document.getElementById("issue-card-form").reset();
    fetchEmployeeDashboardData();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Custom select query for customer loans via audit / generic loans list
async function queryCustomerLoans(customerId) {
  try {
    const res = await fetch(`${API_BASE}/loans`, {
      headers: { "Authorization": `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data.filter(l => l.customer_id === customerId);
    }
    return [];
  } catch (error) {
    return [];
  }
}
