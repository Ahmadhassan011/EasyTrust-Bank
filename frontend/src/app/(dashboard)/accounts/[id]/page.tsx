"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useTransactionHistory } from "@/hooks/useApi";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Landmark, Wallet, PiggyBank, TrendingUp, TrendingDown, FileText, Receipt } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

const typeIcons: Record<string, typeof Wallet> = {
  SAVINGS: PiggyBank,
  CHECKING: Wallet,
  FIXED_DEPOSIT: Landmark,
};

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const accountId = parseInt(id);
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: account, isLoading: loadingAccount } = useAccount(accountId);
  const { data: history } = useTransactionHistory(accountId, { limit, offset: page * limit });

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

  const Icon = typeIcons[account.account_type] ?? Landmark;
  const isDebitIcon = (tx: { from_account_id?: number; type: string }) =>
    tx.from_account_id === accountId ||
    tx.type === "WITHDRAWAL";

  return (
    <div className="space-y-8">
      <Link href="/accounts" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Back to Accounts
      </Link>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-premium overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-navy-900 capitalize">
                    {account.account_type.toLowerCase().replace("_", " ")}
                  </h1>
                  <p className="font-mono text-sm text-navy-400">{account.account_number}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Link href={`/accounts/${accountId}/statement`}>
                  <motion.span whileHover={{ scale: 1.02 }} className="flex items-center gap-1.5 rounded-xl border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50 transition-all">
                    <FileText className="h-3.5 w-3.5" /> Statement
                  </motion.span>
                </Link>
                <span className={`rounded-xl border px-3 py-1.5 text-xs font-medium ${getStatusColor(account.status)}`}>
                  {account.status}
                </span>
              </div>
            </div>
            <div className="divider-gradient my-6" />
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-navy-400">Current Balance</p>
                <p className="text-4xl font-bold text-navy-900 mt-1">
                  {formatCurrency(Number(account.balance), account.currency)}
                </p>
              </div>
              <div className="text-right space-y-2">
                {account.customer && (
                  <div>
                    <p className="text-xs text-navy-400">Account Holder</p>
                    <p className="text-sm font-semibold text-navy-900">
                      {account.customer.first_name} {account.customer.last_name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-navy-400">Daily Limit</p>
                  <p className="text-sm font-semibold text-navy-900">{formatCurrency(Number(account.daily_limit))}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </FadeIn>

      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Transaction History</h2>

        <div className="space-y-2">
          {history?.data?.map((tx, idx) => {
            const isDebit = isDebitIcon(tx);
            return (
              <motion.div
                key={tx.transaction_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
              >
                <div className="card-premium flex items-center justify-between p-4 hover:-translate-y-0.5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isDebit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                    }`}>
                      {isDebit ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900 capitalize">
                        {tx.type.toLowerCase()}
                      </p>
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
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                      <Link href={`/transactions/receipt/${tx.transaction_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-navy-400 hover:text-navy-700 transition-all">
                        <Receipt className="h-3 w-3" /> Receipt
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {(!history?.data || history.data.length === 0) && (
            <FadeIn>
              <div className="card-premium p-12 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-navy-200" />
                <p className="mt-3 text-sm text-navy-400">No transactions yet</p>
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
