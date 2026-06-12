export interface User {
  userId: number;
  role: Role;
  type: "customer" | "employee";
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type Role =
  | "CUSTOMER"
  | "TELLER"
  | "LOAN_OFFICER"
  | "MANAGER"
  | "ADMIN"
  | "AUDITOR";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  mfaToken?: string;
  requiresMfa?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  cnic: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  kyc_status: KycStatus;
  created_at: string;
}

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface Account {
  account_id: number;
  customer_id: number;
  branch_id: number;
  account_number: string;
  account_type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  daily_limit: number;
  opened_at: string;
  customer?: Customer;
  branch?: Branch;
}

export type AccountType = "SAVINGS" | "CHECKING" | "FIXED_DEPOSIT";
export type AccountStatus = "ACTIVE" | "INACTIVE" | "DORMANT" | "CLOSED";

export interface Branch {
  branch_id: number;
  bank_id: number;
  branch_name: string;
  address: string;
  city: string;
  phone?: string;
  is_active: boolean;
}

export interface Transaction {
  transaction_id: number;
  from_account_id?: number;
  to_account_id?: number;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  created_at: string;
  fromAccount?: Account;
  toAccount?: Account;
}

export type TransactionType = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Loan {
  loan_id: number;
  customer_id: number;
  branch_id: number;
  approved_by?: number;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  loan_type: LoanType;
  status: LoanStatus;
  rejection_reason?: string;
  disbursement_date?: string;
  maturity_date?: string;
  repayments?: LoanRepayment[];
}

export type LoanType = "PERSONAL" | "HOME" | "AUTO" | "EDUCATION";
export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "PAID"
  | "DEFAULTED";

export interface LoanRepayment {
  repayment_id: number;
  loan_id: number;
  transaction_id?: number;
  amount_paid: number;
  principal_component: number;
  interest_component: number;
  remaining_balance: number;
  due_date: string;
  paid_date?: string;
  status: string;
}

export interface InterbankTransfer {
  transfer_id: number;
  transaction_id: number;
  raast_network_id: number;
  sender_bank_swift: string;
  receiver_bank_swift: string;
  raast_reference?: string;
  settlement_status: SettlementStatus;
  initiated_at: string;
  settled_at?: string;
}

export type SettlementStatus = "PENDING" | "SETTLED" | "FAILED";

export interface AuditLog {
  log_id: number;
  employee_id?: number;
  entity_type: string;
  entity_id: number;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  logged_at: string;
  ip_address?: string;
}

export interface MonthlyReport {
  month: string;
  total_transactions: number;
  total_amount: number;
  by_type: Record<string, { count: number; total: number }>;
  by_status: Record<string, { count: number; total: number }>;
}
