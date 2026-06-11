<div align="center">

# EasyTrust Bank

[![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2d3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Express](https://img.shields.io/badge/Express-000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

A banking system built with Express and TypeScript, featuring a full online banking domain model, JWT authentication with MFA support, idempotent transactions, and RAAST interbank transfer integration.

[Features](#features) • [API Overview](#api-overview) • [Getting Started](#getting-started)

</div>

## Features

- **Authentication & Authorization** — JWT-based auth with access/refresh tokens, role-based access control (Customer, Teller, Loan Officer, Manager, Admin, Auditor), and TOTP multi-factor authentication for employees.
- **Customer Management** — Full CRUD with KYC status tracking, CNIC validation, and account/loan relationship queries.
- **Account & Card Management** — Multiple account types, balance inquiries, daily limits, active/closed status transitions.
- **Transactions** — Secure deposits, withdrawals, and internal transfers with pessimistic row-level locking (`SELECT ... FOR UPDATE`) and idempotency key support to prevent duplicate processing.
- **Loan Management** — Loan application, officer approval/rejection with reason, repayment with principal/interest breakdown, and maturity tracking.
- **RAAST Interbank Transfers** — Saga-based integration with Pakistan's RAAST instant payment network, including compensating transactions for rollback on failure and settlement status tracking.
- **Audit Logging** — Immutable audit trail for all critical actions with before/after snapshots, employee attribution, and IP address capture.
- **Reports** — Monthly transaction aggregation for management.
- **Security** — Helmet for HTTP headers, rate limiting, Zod request validation, bcrypt password hashing (cost factor 12).

## API Overview

All endpoints except auth are protected by JWT Bearer token authentication.

| Module | Base Path | Key Endpoints |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /mfa/login`, `POST /mfa/setup`, `POST /mfa/enable`, `POST /mfa/disable`, `POST /refresh` |
| **Customers** | `/api/v1/customers` | `GET /`, `GET /:id`, `GET /:id/accounts`, `GET /:id/loans`, `POST /`, `PUT /:id`, `DELETE /:id` |
| **Accounts** | `/api/v1/accounts` | `GET /`, `GET /:id`, `GET /:id/balance`, `GET /customer/:customerId`, `POST /`, `PATCH /:id/status` |
| **Transactions** | `/api/v1/transactions` | `POST /transfer`, `POST /deposit`, `POST /withdraw`, `GET /history/:accountId` |
| **Loans** | `/api/v1/loans` | `POST /apply`, `PATCH /:id/approve`, `PATCH /:id/reject`, `POST /:id/repay`, `GET /customer/:customerId` |
| **Interbank** | `/api/v1/interbank` | `POST /transfer`, `GET /:id/settlement` |
| **Audit** | `/api/v1/audit` | `GET /` |
| **Reports** | `/api/v1/reports` | `GET /monthly-transactions` |
| **Health** | `/health` | `GET /` |

> [!TIP]
> All monetary values are stored as `DECIMAL(15,2)` to avoid floating-point precision issues. Transfers, deposits, and withdrawals support optional `Idempotency-Key` headers for safe retries.

### Roles

| Role | Access Level |
| :--- | :--- |
| `CUSTOMER` | Own profile, accounts, transfers, loan applications & repayments |
| `TELLER` | Customer creation, deposits, withdrawals, interbank transfers |
| `LOAN_OFFICER` | Loan approval/rejection, customer loan history |
| `MANAGER` | Full operational access, account status changes, reports |
| `ADMIN` | Full access including customer deletion |
| `AUDITOR` | Read-only access to customers, accounts, audit logs |

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL 14+
- Redis (optional, for extended session caching)

### Setup

```bash
# 1. Create the database
./setup.sh

# 2. Install backend dependencies
cd project/backend && npm install

# 3. Generate Prisma client
npm run prisma:generate

# 4. Configure environment
# Edit project/backend/.env with your database credentials

# 5. Start the development server
npm run dev
```

The server runs at `http://localhost:3000` by default.

### Database

The `setup-database.sql` script and Prisma schema define 12 tables with full foreign key relationships, performance indexes on frequently queried columns (CNIC, email, account number, dates, statuses), and a database-level comment.

Key tables: `bank`, `raast_network`, `customer`, `branch`, `employee`, `account`, `card`, `loan`, `transaction`, `interbank_transfer`, `loan_repayment`, `audit_log`.

### Running Tests

```bash
# Unit tests (interbank saga)
npm test
```

Tests use Node's built-in `node:test` runner with mocked Prisma and fetch, covering the full interbank transfer saga lifecycle including success, RAAST rejection, network errors, and validation checks.


