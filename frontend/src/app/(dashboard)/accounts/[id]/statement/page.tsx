"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useAccountBalance, useTransactionHistory } from "@/hooks/useApi";
import { formatCurrency, formatDateTime, formatDate, getStatusColor } from "@/lib/utils";
import { FadeIn } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Download, TrendingUp, TrendingDown, Landmark, Printer } from "lucide-react";

export default function StatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const accountId = parseInt(id);

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data: account, isLoading: loadingAccount } = useAccount(accountId);
  const { data: balance } = useAccountBalance(accountId);
  const { data: history } = useTransactionHistory(accountId, {
    limit,
    offset: page * limit,
    startDate: fromDate,
    endDate: toDate,
  });

  const summary = useMemo(() => {
    if (!history?.data) return { credits: 0, debits: 0, count: 0 };
    return history.data.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount);
        const isDebit = tx.from_account_id === accountId || tx.type === "WITHDRAWAL";
        if (isDebit) acc.debits += amount;
        else acc.credits += amount;
        acc.count += 1;
        return acc;
      },
      { credits: 0, debits: 0, count: 0 },
    );
  }, [history, accountId]);

  const openingBalance = useMemo(() => {
    if (!balance) return 0;
    return Number(balance.balance) - summary.credits + summary.debits;
  }, [balance, summary]);

  if (loadingAccount) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-4 w-32" />
        <CardSkeleton />
      </div>
    );
  }

  if (!account) {
    return (
      <FadeIn>
        <div className="card-premium p-16 text-center">
          <Landmark className="mx-auto h-10 w-10 text-navy-200" />
          <p className="mt-4 text-navy-500">Account not found</p>
          <Link href="/accounts" className="mt-4 inline-block text-sm font-semibold text-navy-900 hover:text-navy-700">&larr; Back to Accounts</Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-8">
      <Link href={`/accounts/${accountId}`} className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Account Details
      </Link>

      <FadeIn>
        <div className="card-premium p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
                <Landmark className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">Account Statement</h1>
                <p className="font-mono text-sm text-navy-400">{account.account_number}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50 print:hidden transition-all"
            >
              <Printer className="h-4 w-4" /> Print
            </motion.button>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="card-premium p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-navy-700 mb-4">
            <Calendar className="h-4 w-4 text-navy-400" /> Date Range
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-navy-400">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm text-navy-900 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-navy-400">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm text-navy-900 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all"
              />
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card-premium p-4 text-center">
            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Opening Balance</p>
            <p className="mt-1 text-lg font-bold text-navy-900">{formatCurrency(openingBalance)}</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Total Credits</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(summary.credits)}</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Total Debits</p>
            <p className="mt-1 text-lg font-bold text-red-500">{formatCurrency(summary.debits)}</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Closing Balance</p>
            <p className="mt-1 text-lg font-bold text-navy-900">{balance ? formatCurrency(Number(balance.balance)) : "—"}</p>
          </div>
        </div>
      </FadeIn>

      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">
          Transactions ({summary.count})
        </h2>

        <div className="space-y-2">
          {history?.data?.map((tx, idx) => {
            const isDebit = tx.from_account_id === accountId || tx.type === "WITHDRAWAL";
            return (
              <motion.div
                key={tx.transaction_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.2 }}
              >
                <div className="card-premium flex items-center justify-between p-4 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isDebit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                    }`}>
                      {isDebit ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900 capitalize">{tx.type.toLowerCase()}</p>
                      <p className="text-xs text-navy-400">
                        {formatDateTime(tx.created_at)}
                        {tx.description && ` • ${tx.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${isDebit ? "text-red-500" : "text-emerald-500"}`}>
                      {isDebit ? "-" : "+"}{formatCurrency(Number(tx.amount), tx.currency)}
                    </p>
                    <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {(!history?.data || history.data.length === 0) && (
            <FadeIn>
              <div className="card-premium p-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-navy-200" />
                <p className="mt-3 text-sm text-navy-400">No transactions in this date range</p>
              </div>
            </FadeIn>
          )}
        </div>

        {history?.total && history.total > limit && (
          <div className="mt-6 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
              className="rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-900 hover:text-white hover:border-navy-900 disabled:opacity-50 transition-all">
              Previous
            </motion.button>
            <span className="text-sm text-navy-400">
              Page {page + 1} of {Math.ceil(history.total / limit)}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setPage(page + 1)} disabled={(page + 1) * limit >= (history.total ?? 0)}
              className="rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-900 hover:text-white hover:border-navy-900 disabled:opacity-50 transition-all">
              Next
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
