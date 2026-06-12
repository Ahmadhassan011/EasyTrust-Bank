"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useAccounts, useCustomerAccounts } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Landmark, ArrowLeftRight, HandCoins, Plus, TrendingUp, Wallet, PiggyBank, Building2, ArrowUpRight } from "lucide-react";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.type === "customer";
  const isEmployee = user?.type === "employee";

  const { data: allAccounts, isLoading: loadingAccounts } = useAccounts();
  const { data: customerAccounts } = useCustomerAccounts(user?.userId ?? 0);

  const accounts = isCustomer ? customerAccounts : allAccounts;
  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  const activeAccounts = accounts?.filter((a) => a.status === "ACTIVE").length ?? 0;

  if (loadingAccounts) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-48" />
          </div>
          <Skeleton className="h-20 w-40 rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-navy-400">Welcome back</p>
            <h1 className="mt-1 text-3xl font-bold text-navy-900">
              {user?.firstName ?? "User"}
            </h1>
            <p className="mt-1 text-sm text-navy-400">
              {activeAccounts} active account{activeAccounts !== 1 ? "s" : ""} &middot; {isEmployee ? "Employee" : "Customer"} dashboard
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} className="gradient-card rounded-2xl px-7 py-5 text-right shadow-lg shadow-navy-900/20">
            <p className="text-xs font-medium text-white/50">Total Balance</p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-1 text-2xl font-bold text-white">
              {formatCurrency(totalBalance)}
            </motion.p>
            <p className="mt-1 text-xs text-white/30">{accounts?.length ?? 0} accounts</p>
          </motion.div>
        </div>
      </FadeIn>

      {isEmployee && (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/accounts/create", icon: Plus, label: "New Account", desc: "Open an account", color: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" },
            { href: "/transactions/deposit", icon: TrendingUp, label: "Deposit", desc: "Cash deposit", color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" },
            { href: "/customers/create", icon: Plus, label: "New Customer", desc: "Register customer", color: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" },
            { href: "/loans", icon: HandCoins, label: "Loans", desc: "Manage loans", color: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" },
          ].map((item) => (
            <StaggerItem key={item.href}>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link href={item.href} className="group card-premium flex items-center gap-4 p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{item.label}</p>
                    <p className="text-xs text-navy-400">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-navy-300 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}

      {isCustomer && (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/transactions/transfer", icon: ArrowLeftRight, label: "Transfer Funds", desc: "Send money between accounts" },
            { href: "/transactions/deposit", icon: TrendingUp, label: "Deposit", desc: "Add funds to your account" },
            { href: "/loans/apply", icon: HandCoins, label: "Apply for Loan", desc: "Borrow for personal or business use" },
            { href: "/loans", icon: Building2, label: "My Loans", desc: "View and manage your loans" },
          ].map((item) => (
            <StaggerItem key={item.href}>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link href={item.href} className="group card-premium flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-100 text-navy-700 transition-all group-hover:bg-navy-900 group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{item.label}</p>
                    <p className="text-xs text-navy-400">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-navy-300 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-navy-900">Accounts</h2>
          <span className="text-xs text-navy-400">{accounts?.length ?? 0} account{(accounts?.length ?? 0) !== 1 ? "s" : ""}</span>
        </div>

        {accounts && accounts.length > 0 ? (
          <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.slice(0, 6).map((account) => (
              <StaggerItem key={account.account_id}>
                <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Link href={`/accounts/${account.account_id}`} className="group card-premium overflow-hidden block">
                    <div className="relative p-6 pb-20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-700 group-hover:bg-navy-900 group-hover:text-white transition-all">
                          {account.account_type === "SAVINGS" ? <PiggyBank className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-900 capitalize">
                            {account.account_type.toLowerCase().replace("_", " ")}
                          </p>
                          <p className="font-mono text-xs text-navy-400">
                            {account.account_number.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-4">
                      <p className="text-xs font-medium text-white/50">Balance</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(Number(account.balance), account.currency)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
                          {account.status}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
                          {account.currency}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <FadeIn>
            <div className="card-premium p-16 text-center">
              <Landmark className="mx-auto h-10 w-10 text-navy-200" />
              <p className="mt-4 text-sm font-medium text-navy-500">No accounts yet</p>
              <Link href="/accounts/create" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-navy-700 transition-colors">
                <Plus className="h-4 w-4" /> Open an account
              </Link>
            </div>
          </FadeIn>
        )}
      </div>

      {accounts && accounts.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="card-premium p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">Quick Actions</h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { href: "/transactions/transfer", label: "Transfer", icon: ArrowLeftRight },
                { href: "/transactions/deposit", label: "Deposit", icon: TrendingUp },
                { href: "/transactions/withdraw", label: "Withdraw", icon: Wallet },
                { href: "/interbank/transfer", label: "Interbank", icon: Building2 },
              ].map((action) => (
                <motion.div key={action.href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href={action.href}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
