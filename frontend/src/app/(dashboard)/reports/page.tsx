"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ApiResponse, MonthlyReport } from "@/types";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { Select } from "@/components/ui/form-field";

const months = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

const typeIcons: Record<string, typeof TrendingUp> = {
  DEPOSIT: TrendingUp,
  TRANSFER: TrendingUp,
  WITHDRAWAL: TrendingDown,
};

const typeColors: Record<string, string> = {
  DEPOSIT: "text-emerald-600 bg-emerald-50",
  TRANSFER: "text-blue-600 bg-blue-50",
  WITHDRAWAL: "text-red-600 bg-red-50",
};

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: report, isLoading } = useQuery({
    queryKey: ["reports", "monthly", year, month],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MonthlyReport>>(
        "/reports/monthly-transactions",
        { params: { year, month } },
      );
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100">
            <BarChart3 className="h-5 w-5 text-navy-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Monthly Report</h1>
            <p className="text-sm text-navy-500">Transaction summary for a given month.</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex gap-3 card-premium p-4">
          <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : report ? (
        <StaggerGrid className="grid gap-6 md:grid-cols-2">
          <StaggerItem>
            <motion.div whileHover={{ y: -2 }} className="card-premium p-6">
              <h2 className="text-lg font-semibold text-navy-900">Summary</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
                  <span className="text-sm text-navy-500">Total Transactions</span>
                  <span className="text-xl font-bold text-navy-900">{report.total_transactions}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
                  <span className="text-sm text-navy-500">Total Amount</span>
                  <span className="text-xl font-bold text-navy-900">{formatCurrency(Number(report.total_amount))}</span>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div whileHover={{ y: -2 }} className="card-premium p-6">
              <h2 className="text-lg font-semibold text-navy-900">By Type</h2>
              <div className="mt-6 space-y-3">
                {Object.entries(report.by_type ?? {}).map(([type, stats]) => {
                  const Icon = typeIcons[type] ?? Minus;
                  return (
                    <div key={type} className="flex items-center gap-4 rounded-xl px-4 py-3 bg-navy-50">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeColors[type] ?? "text-navy-600 bg-navy-200"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy-900 capitalize">{type.toLowerCase()}</p>
                        <p className="font-mono text-xs text-navy-500">{stats.count} transactions</p>
                      </div>
                      <p className="font-mono text-sm font-bold text-navy-900">{formatCurrency(Number(stats.total))}</p>
                    </div>
                  );
                })}
                {(!report.by_type || Object.keys(report.by_type).length === 0) && (
                  <p className="text-sm text-navy-400">No data</p>
                )}
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div whileHover={{ y: -2 }} className="card-premium p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-navy-900">By Status</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {Object.entries(report.by_status ?? {}).map(([status, stats]) => (
                  <div key={status} className="rounded-xl border border-navy-100 bg-navy-50 p-5 text-center">
                    <p className="text-sm font-medium text-navy-500 capitalize">{status.toLowerCase()}</p>
                    <p className="mt-2 text-3xl font-bold text-navy-900">{stats.count}</p>
                    <p className="mt-1 font-mono text-sm text-navy-500">{formatCurrency(Number(stats.total))}</p>
                  </div>
                ))}
                {(!report.by_status || Object.keys(report.by_status).length === 0) && (
                  <p className="text-sm text-navy-400">No data</p>
                )}
              </div>
            </motion.div>
          </StaggerItem>
        </StaggerGrid>
      ) : (
        <FadeIn>
          <div className="card-premium p-16 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-navy-200" />
            <p className="mt-4 text-sm font-medium text-navy-500">Select a month to view the report.</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
