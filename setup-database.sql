-- EasyTrust Bank Database Setup
-- Run this SQL when PostgreSQL is available
-- This uses `created_at` convention (not timestamp_created_at)

-- ============================================================================
-- TABLE 1: BANK
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank (
    bank_id SERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    swift_code VARCHAR(11) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    headquarters VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 2: RAAST_NETWORK
-- ============================================================================
CREATE TABLE IF NOT EXISTS raast_network (
    raast_id SERIAL PRIMARY KEY,
    network_name VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(255) NOT NULL,
    auth_token_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 3: CUSTOMER
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    cnic VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    dob DATE,
    kyc_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 4: BRANCH
-- ============================================================================
CREATE TABLE IF NOT EXISTS branch (
    branch_id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL REFERENCES bank(bank_id),
    branch_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 5: EMPLOYEE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee (
    employee_id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 6: ACCOUNT
-- ============================================================================
CREATE TABLE IF NOT EXISTS account (
    account_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(customer_id),
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'PKR',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 7: CARD
-- ============================================================================
CREATE TABLE IF NOT EXISTS card (
    card_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES account(account_id),
    card_number VARCHAR(16) NOT NULL UNIQUE,
    card_type VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    cvv_hash VARCHAR(255) NOT NULL,
    daily_limit DECIMAL(10,2) DEFAULT 50000.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 8: LOAN
-- ============================================================================
CREATE TABLE IF NOT EXISTS loan (
    loan_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(customer_id),
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    approved_by INTEGER REFERENCES employee(employee_id),
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    disbursement_date DATE,
    maturity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 9: TRANSACTION
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction (
    transaction_id SERIAL PRIMARY KEY,
    from_account_id INTEGER REFERENCES account(account_id),
    to_account_id INTEGER REFERENCES account(account_id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 10: INTERBANK_TRANSFER
-- ============================================================================
CREATE TABLE IF NOT EXISTS interbank_transfer (
    transfer_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL UNIQUE REFERENCES transaction(transaction_id),
    raast_network_id INTEGER NOT NULL REFERENCES raast_network(raast_id),
    sender_bank_swift VARCHAR(11) NOT NULL,
    receiver_bank_swift VARCHAR(11) NOT NULL,
    raast_reference VARCHAR(255) UNIQUE,
    settlement_status VARCHAR(50) DEFAULT 'PENDING',
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- TABLE 11: LOAN_REPAYMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS loan_repayment (
    repayment_id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loan(loan_id),
    transaction_id INTEGER UNIQUE REFERENCES transaction(transaction_id),
    amount_paid DECIMAL(15,2) NOT NULL,
    principal_component DECIMAL(15,2) NOT NULL,
    interest_component DECIMAL(15,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 12: AUDIT_LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employee(employee_id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_customer_cnic ON customer(cnic);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_account_customer_id ON account(customer_id);
CREATE INDEX IF NOT EXISTS idx_account_branch_id ON account(branch_id);
CREATE INDEX IF NOT EXISTS idx_account_account_number ON account(account_number);
CREATE INDEX IF NOT EXISTS idx_transaction_from_account_id ON transaction(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transaction_to_account_id ON transaction(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON transaction(created_at);
CREATE INDEX IF NOT EXISTS idx_loan_customer_id ON loan(customer_id);
CREATE INDEX IF NOT EXISTS idx_loan_branch_id ON loan(branch_id);
CREATE INDEX IF NOT EXISTS idx_loan_status ON loan(status);
CREATE INDEX IF NOT EXISTS idx_loan_repayment_loan_id ON loan_repayment(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayment_due_date ON loan_repayment(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_employee_id ON audit_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type_id ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_card_account_id ON card(account_id);
CREATE INDEX IF NOT EXISTS idx_card_status ON card(status);

-- ============================================================================
-- TABLE 13: CREDENTIAL (Decoupled Auth Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS credential (
    credential_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DONE
-- ============================================================================
COMMENT ON DATABASE easytrust_bank IS 'EasyTrust Bank - Online Banking System with created_at convention';
