# EasyTrust Bank - Online Banking System

An online banking system with loan management capabilities, implementing distributed transaction processing with Two-Phase Commit (2PC) protocol.

## Features

- **Customer Management**: KYC verification, account management
- **Transaction Processing**: Internal transfers, deposits, withdrawals
- **Loan Management**: Applications, amortization, repayments
- **Interbank Transfers**: Raast network integration for cross-bank transfers
- **Distributed Transactions**: Two-Phase Commit (2PC) protocol for atomicity
- **Audit Trail**: Immutable audit logs for regulatory compliance
- **Multi-Branch Support**: Manage multiple bank branches with hierarchical structure

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching/Coordination**: Redis (for distributed locking)
- **Authentication**: JWT with MFA support

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6 (for Phase 6+)

## Setup Instructions

### 1. Install Dependencies

```bash
cd project/backend
npm install
```

### 2. Configure Environment

Copy the example env file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/easytrust_bank?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV="development"
```

### 3. Create PostgreSQL Database

From the **project/** directory:

```bash
./setup.sh
```

This will:
- Check PostgreSQL is running
- Create the `easytrust_bank` database
- Run `setup-database.sql` to create all 12 tables with `created_at` convention
- Apply performance indexes

Or manually:
```bash
sudo -u postgres createdb easytrust_bank
psql -U postgres -d easytrust_bank -f setup-database.sql
```

### 4. Generate Prisma Client

```bash
cd project/backend
npm run prisma:generate
```

### 5. Start Development Server

```bash
npm run dev
```

Server will run at `http://localhost:3000`

## Database Schema

The system uses 12 normalized tables (3NF) with Prisma ORM:

- **bank**: Bank institutions with SWIFT codes
- **branch**: Physical branch locations
- **customer**: Customer profiles with KYC status
- **account**: Financial accounts (savings, checking, fixed deposit)
- **card**: Debit/credit cards with daily limits
- **employee**: Bank staff with roles
- **loan**: Loan products with interest rates
- **loan_repayment**: Amortization schedules
- **transaction**: All financial movements
- **interbank_transfer**: Raast network transfers
- **raast_network**: Raast API configuration
- **audit_log**: Immutable audit trail

## API Endpoints (Planned)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/mfa/verify

GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id/accounts

GET    /api/v1/accounts/:id/balance
POST   /api/v1/accounts/:id/transfer

GET    /api/v1/transactions/history

POST   /api/v1/loans/apply
PUT    /api/v1/loans/:id/approve
POST   /api/v1/loans/:id/repay

POST   /api/v1/interbank/transfer

GET    /api/v1/audit
```

## Useful Commands

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Run production build

# Prisma
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open database GUI
```

## License

MIT
