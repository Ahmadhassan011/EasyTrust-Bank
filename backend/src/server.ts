const express = require('express');
import type { Request, Response, NextFunction } from 'express';
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN || "*";
const corsOptions = {
  origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((s) => s.trim()),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { authenticate } = require('./middleware/auth');

const authRoutes = require('./modules/auth/auth.routes');
const customerRoutes = require('./modules/customer/customer.routes');
const accountRoutes = require('./modules/account/account.routes');
const transactionRoutes = require('./modules/transaction/transaction.routes');
const loanRoutes = require('./modules/loan/loan.routes');
const interbankRoutes = require('./modules/interbank/interbank.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const coordinatorRoutes = require('./modules/coordinator/coordinator.routes');
const cardRoutes = require('./modules/card/card.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', authenticate, customerRoutes);
app.use('/api/v1/accounts', authenticate, accountRoutes);
app.use('/api/v1/transactions', authenticate, transactionRoutes);
app.use('/api/v1/loans', authenticate, loanRoutes);
app.use('/api/v1/interbank', authenticate, interbankRoutes);
app.use('/api/v1/audit', authenticate, auditRoutes);
app.use('/api/v1/reports', authenticate, reportsRoutes);
app.use('/api/v1/coordinator', authenticate, coordinatorRoutes);
app.use('/api/v1/cards', authenticate, cardRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: err.message },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
