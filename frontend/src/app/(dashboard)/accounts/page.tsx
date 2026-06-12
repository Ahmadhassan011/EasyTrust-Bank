"use client";

import { motion } from "framer-motion";
import { useAccounts } from "@/hooks/useApi";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { Landmark, Plus, Wallet, PiggyBank, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

const typeIcons: Record<string, typeof Wallet> = {
  SAVINGS: PiggyBank,
  CHECKING: Wallet,
  FIXED_DEPOSIT: Landmark,
};

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === "TELLER" || user?.role === "MANAGER" || user?.role === "ADMIN";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-navy-400">Overview</p>
            <h1 className="text-2xl font-bold text-navy-900">Accounts</h1>
            <p className="mt-0.5 text-sm text-navy-400">{accounts?.length ?? 0} total</p>
          </div>
          {canCreate && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/accounts/create"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">
                <Plus className="h-4 w-4" />
                New Account
              </Link>
            </motion.div>
          )}
        </div>
      </FadeIn>

      <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {accounts?.map((account) => {
          const Icon = typeIcons[account.account_type] ?? Landmark;
          return (
            <StaggerItem key={account.account_id}>
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link href={`/accounts/${account.account_id}`}
                  className="group card-premium overflow-hidden block">
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-100 text-navy-700 transition-all group-hover:bg-navy-900 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-900 capitalize">
                            {account.account_type.toLowerCase().replace("_", " ")}
                          </p>
                          <p className="font-mono text-xs text-navy-400">{account.account_number}</p>
                        </div>
                      </div>
                      <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </div>
                    <p className="mt-6 text-2xl font-bold text-navy-900">
                      {formatCurrency(Number(account.balance), account.currency)}
                    </p>
                  </div>
                  {account.customer && (
                    <div className="border-t border-navy-100 px-6 py-3 flex items-center justify-between">
                      <p className="text-xs text-navy-400">
                        {account.customer.first_name} {account.customer.last_name}
                      </p>
                      <ArrowUpRight className="h-3.5 w-3.5 text-navy-300 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  )}
                </Link>
              </motion.div>
            </StaggerItem>
          );
        })}
        {(!accounts || accounts.length === 0) && (
          <StaggerItem>
            <div className="col-span-full card-premium p-16 text-center">
              <Landmark className="mx-auto h-10 w-10 text-navy-200" />
              <p className="mt-4 text-sm font-medium text-navy-500">No accounts found</p>
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
