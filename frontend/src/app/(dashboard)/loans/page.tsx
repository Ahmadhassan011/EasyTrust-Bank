"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useCustomerLoans } from "@/hooks/useApi";
import Link from "next/link";
import { HandCoins, Plus, ArrowUpRight } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function LoansPage() {
  const user = useAuthStore((s) => s.user);
  const customerId = user?.userId ?? 0;
  const isCustomer = user?.type === "customer";

  const { data: loans, isLoading } = useCustomerLoans(customerId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-24" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-navy-400">Loans</p>
            <h1 className="text-2xl font-bold text-navy-900">Loans</h1>
            <p className="mt-0.5 text-sm text-navy-400">{loans?.length ?? 0} loan{loans?.length !== 1 ? "s" : ""}</p>
          </div>
          {isCustomer && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/loans/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">
                <Plus className="h-4 w-4" />
                Apply for Loan
              </Link>
            </motion.div>
          )}
        </div>
      </FadeIn>

      <StaggerGrid className="grid gap-4 md:grid-cols-2">
        {loans?.map((loan) => (
          <StaggerItem key={loan.loan_id}>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <Link href={`/loans/${loan.loan_id}`}
                className="group card-premium p-6 block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-700 group-hover:bg-navy-900 group-hover:text-white transition-all">
                      <HandCoins className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 capitalize">
                        {loan.loan_type.toLowerCase()} Loan
                      </p>
                      <p className="text-xs text-navy-500">{loan.tenure_months} months @ {Number(loan.interest_rate)}%</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-navy-300 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="mt-5 text-2xl font-bold text-navy-900">
                  {formatCurrency(Number(loan.principal_amount))}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                  {loan.disbursement_date && (
                    <span className="text-xs text-navy-400">
                      Disbursed {new Date(loan.disbursement_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          </StaggerItem>
        ))}
        {(!loans || loans.length === 0) && (
          <StaggerItem>
            <div className="col-span-full card-premium p-12 text-center">
              <HandCoins className="mx-auto h-8 w-8 text-navy-300" />
              <p className="mt-3 text-sm font-medium text-navy-500">No loans found.</p>
              {isCustomer && (
                <Link href="/loans/apply" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-navy-700 transition-colors">
                  Apply for a loan <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </StaggerItem>
        )}
      </StaggerGrid>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
