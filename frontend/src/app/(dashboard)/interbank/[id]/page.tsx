"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Building2, RefreshCw } from "lucide-react";
import type { ApiResponse, InterbankTransfer } from "@/types";
import { FadeIn } from "@/components/ui/animations";

export default function InterbankSettlementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const transferId = parseInt(id);
  const [checking, setChecking] = useState(false);

  const { data: transfer, isLoading, refetch } = useQuery({
    queryKey: ["interbank", transferId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<InterbankTransfer>>(`/interbank/${transferId}/settlement`);
      return data.data;
    },
    enabled: !!transferId,
  });

  async function checkStatus() {
    setChecking(true);
    await refetch();
    setChecking(false);
  }

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-premium p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Interbank Transfer</h1>
              <p className="text-sm text-navy-500">Raast settlement details</p>
            </div>
          </div>

          <div className="divider-gradient my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm text-navy-500">Transfer ID</span>
              <span className="font-mono font-semibold text-navy-900">#{transfer?.transfer_id}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm text-navy-500">Raast Reference</span>
              <span className="font-mono text-sm text-navy-700">{transfer?.raast_reference ?? "Pending..."}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm text-navy-500">Sender SWIFT</span>
              <span className="font-mono text-sm text-navy-900">{transfer?.sender_bank_swift}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm text-navy-500">Receiver SWIFT</span>
              <span className="font-mono text-sm text-navy-900">{transfer?.receiver_bank_swift}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm text-navy-500">Initiated</span>
              <span className="text-sm text-navy-700">{transfer ? formatDateTime(transfer.initiated_at) : "—"}</span>
            </div>
            {transfer?.settled_at && (
              <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
                <span className="text-sm text-navy-500">Settled</span>
                <span className="text-sm text-navy-700">{formatDateTime(transfer.settled_at)}</span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm font-medium text-navy-700">Settlement Status</span>
              <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${getStatusColor(transfer?.settlement_status ?? "")}`}>
                {transfer?.settlement_status}
              </span>
            </div>
          </div>

          <motion.button onClick={checkStatus} disabled={checking}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-50 transition-all">
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "Check Settlement Status"}
          </motion.button>
        </motion.div>
      </FadeIn>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
