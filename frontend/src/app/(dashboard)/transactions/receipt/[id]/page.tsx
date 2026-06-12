"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTransaction } from "@/hooks/useApi";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { FadeIn } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Printer, Landmark, CheckCircle2, ArrowRight, Building2, User } from "lucide-react";

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const transactionId = parseInt(id);
  const { data: tx, isLoading } = useTransaction(transactionId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-4 w-32" />
        <CardSkeleton />
      </div>
    );
  }

  if (!tx) {
    return (
      <FadeIn>
        <div className="card-premium p-16 text-center">
          <Landmark className="mx-auto h-10 w-10 text-navy-200" />
          <p className="mt-4 text-navy-500">Transaction not found</p>
          <Link href="/transactions/transfer" className="mt-4 inline-block text-sm font-semibold text-navy-900 hover:text-navy-700">&larr; Back to Transactions</Link>
        </div>
      </FadeIn>
    );
  }

  const isDebit = !!tx.from_account_id;
  const fromAcc = tx.fromAccount as any;
  const toAcc = tx.toAccount as any;

  return (
    <div className="space-y-8">
      <Link href="/transactions/transfer" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all print:hidden">
        <ArrowLeft className="h-4 w-4" /> Transactions
      </Link>

      <div>
        <div className="flex justify-end mb-4 print:hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50 transition-all"
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </motion.button>
        </div>

        <FadeIn>
          <div className="card-premium overflow-hidden">
            {/* Receipt Header */}
            <div className="bg-navy-900 px-8 py-6 text-white text-center print:bg-navy-900">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Landmark className="h-5 w-5" />
                </div>
              </div>
              <h2 className="text-lg font-bold">EasyTrust Bank</h2>
              <p className="text-xs text-white/60">Transaction Receipt</p>
            </div>

            {/* Status Badge */}
            <div className="px-8 pt-6 flex justify-center">
              <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${getStatusColor(tx.status)}`}>
                {tx.status === "COMPLETED" && <CheckCircle2 className="h-4 w-4" />}
                {tx.status}
              </div>
            </div>

            {/* Amount */}
            <div className="px-8 pt-4 pb-6 text-center">
              <p className="text-3xl font-bold text-navy-900">
                {formatCurrency(Number(tx.amount), tx.currency)}
              </p>
              <p className="mt-1 text-sm font-medium text-navy-400 capitalize">{tx.type.toLowerCase()}</p>
            </div>

            <div className="divider-gradient mx-8" />

            {/* Transaction Details */}
            <div className="px-8 py-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-navy-400">Transaction ID</span>
                <span className="text-sm font-semibold text-navy-900 font-mono">#{tx.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-navy-400">Date & Time</span>
                <span className="text-sm font-semibold text-navy-900">{formatDateTime(tx.created_at)}</span>
              </div>
              {tx.description && (
                <div className="flex justify-between">
                  <span className="text-sm text-navy-400">Description</span>
                  <span className="text-sm font-semibold text-navy-900 text-right max-w-[200px]">{tx.description}</span>
                </div>
              )}
            </div>

            <div className="divider-gradient mx-8" />

            {/* Account Details */}
            <div className="px-8 py-6">
              {isDebit && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">From</p>
                    <p className="text-sm font-semibold text-navy-900">{fromAcc?.account_number ?? "—"}</p>
                    {fromAcc?.customer && (
                      <p className="text-xs text-navy-400">{fromAcc.customer.first_name} {fromAcc.customer.last_name}</p>
                    )}
                  </div>
                </div>
              )}
              {tx.to_account_id && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">To</p>
                    <p className="text-sm font-semibold text-navy-900">{toAcc?.account_number ?? "—"}</p>
                    {toAcc?.customer && (
                      <p className="text-xs text-navy-400">{toAcc.customer.first_name} {toAcc.customer.last_name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-navy-50 px-8 py-4 text-center text-xs text-navy-400 print:bg-navy-50">
              This is a computer-generated receipt. No signature required.
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
