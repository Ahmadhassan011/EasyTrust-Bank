<div align="center">

# EasyTrust Bank

[![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2d3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Express](https://img.shields.io/badge/Express-000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

A full-stack distributed online banking system with Express + TypeScript backend and Next.js 16 frontend. JWT auth with MFA, idempotent transactions, RAAST interbank transfer integration, and responsive dashboard.

[Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started)

</div>

## Features

- **Authentication & Authorization** — JWT-based auth with access/refresh tokens, role-based access control (Customer, Teller, Loan Officer, Manager, Admin, Auditor), and TOTP multi-factor authentication for employees.
- **Customer Management** — Full CRUD with KYC status tracking, CNIC validation, and account/loan relationship queries.
- **Account & Card Management** — Multiple account types (Savings, Checking, Fixed Deposit), balance inquiries, daily limits, status transitions.
- **Transactions** — Secure deposits, withdrawals, and internal transfers with pessimistic row-level locking (`SELECT ... FOR UPDATE`) and idempotency key support to prevent duplicate processing.
- **Loan Management** — Loan application, officer approval/rejection with reason, repayment with principal/interest breakdown, and maturity tracking.
- **RAAST Interbank Transfers** — Saga-based integration with Pakistan's RAAST instant payment network, including compensating transactions for rollback on failure and settlement status tracking.
- **Two-Phase Commit Coordinator** — Redis-backed distributed transaction coordinator for managing interbank saga lifecycles.
- **Audit Logging** — Immutable audit trail for all critical actions with before/after snapshots, employee attribution, and IP address capture.
- **Reports & Dashboards** — Real-time balance overview, monthly transaction aggregation, customer analytics.
- **Security** — Helmet for HTTP headers, rate limiting, Zod request validation, bcrypt password hashing (cost factor 12).

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, shadcn/ui, Framer Motion, Zustand, TanStack Query, Axios, Sonner |
| **Backend** | Express.js, TypeScript, Prisma ORM, Zod validation, JWT (jose), bcrypt |
| **Database** | PostgreSQL 16 (ACID, row-level locking, JSONB audit logs) |
| **Cache** | Redis 7 (session storage, distributed locking for 2PC coordinator) |
| **Infrastructure** | Docker Compose, multi-stage Docker builds |

## Architecture

A full architectural deep-dive is available in [`ARCHITECTURE_LEARNING_STUDY.md`](../ARCHITECTURE_LEARNING_STUDY.md).

### Key Design Decisions

- **PostgreSQL over NoSQL** — Banking demands ACID compliance. `SELECT...FOR UPDATE` pessimistic locking prevents race conditions on balance updates. `CHECK (balance >= 0)` enforces invariants at the database level.
- **Idempotency on all mutations** — Every financial endpoint accepts an idempotency key. Network retries never cause double-posting.
- **Saga pattern for interbank** — Cross-bank transfers use a compensate-on-failure saga. Intra-bank transfers use true ACID transactions with row-level locks.
- **Immutable audit logs** — Transactions and audit records are INSERT-only. Financial history cannot be altered.

## API Overview

| Module | Base Path | Key Endpoints |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /mfa/*`, `POST /refresh` |
| **Customers** | `/api/v1/customers` | `GET /`, `GET /:id`, `POST /`, `PUT /:id` |
| **Accounts** | `/api/v1/accounts` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id/status` |
| **Transactions** | `/api/v1/transactions` | `POST /transfer`, `POST /deposit`, `POST /withdraw`, `GET /history/:id` |
| **Loans** | `/api/v1/loans` | `POST /apply`, `PATCH /:id/approve`, `PATCH /:id/reject`, `POST /:id/repay` |
| **Interbank** | `/api/v1/interbank` | `POST /transfer`, `GET /:id/settlement` |
| **Coordinator** | `/api/v1/coordinator` | `POST /transfer` (2PC orchestration) |
| **Audit** | `/api/v1/audit` | `GET /` (filterable) |
| **Reports** | `/api/v1/reports` | `GET /monthly-transactions`, `GET /dashboard` |
| **Cards** | `/api/v1/cards` | `GET /`, `POST /`, `PATCH /:id/status` |
| **Health** | `/health` | `GET /` |

### Roles

| Role | Access |
| :--- | :--- |
| `CUSTOMER` | Own profile, accounts, transfers, loan applications & repayments |
| `TELLER` | Customer creation, deposits, withdrawals, interbank transfers |
| `LOAN_OFFICER` | Loan approval/rejection, customer loan history |
| `MANAGER` | Full operational access, account status changes, reports |
| `ADMIN` | Full access including employee management |
| `AUDITOR` | Read-only access to customers, accounts, audit logs |

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (recommended) or PostgreSQL 16 + Redis 7

### Docker Setup (Recommended)

```bash
# Start all services
docker compose up -d

# Seed the database
docker compose exec backend npm run prisma:seed

# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
```

### Manual Setup

```bash
# 1. Create the database
./setup.sh

# 2. Backend
cd project/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# 3. Frontend (separate terminal)
cd project/frontend
pnpm install
pnpm dev
```

### Test Accounts

After seeding, you can log in with:
- **Customer**: email: `customer1@example.com`, password: `password123`
- **Employee**: email: `teller1@easytrustbank.com`, password: `password123`

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/          # Prisma, Redis clients
│   │   ├── middleware/       # Auth (JWT), Zod validation
│   │   ├── modules/         # Domain modules (auth, account, transaction, loan, etc.)
│   │   └── utils/           # Response helpers
│   └── prisma/              # Schema, migrations, seed
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # UI components (layout, ui, shadcn)
│   │   ├── hooks/           # API hooks (TanStack Query)
│   │   ├── lib/             # API client, utilities
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets, favicons
├── docker-compose.yml       # PostgreSQL + Redis + Backend + Frontend
└── Makefile                 # Convenience commands
```

### Available Make Commands

```bash
make up          # Start all services
make down        # Stop all services
make build       # Rebuild and start
make logs        # Follow logs
make seed        # Seed database
make test        # Run backend tests
```
