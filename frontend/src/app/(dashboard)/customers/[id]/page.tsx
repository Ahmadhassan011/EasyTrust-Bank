"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCustomer, useCustomerAccounts, useCustomerLoans } from "@/hooks/useApi";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Landmark, HandCoins, User, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customerId = parseInt(id);

  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: accounts } = useCustomerAccounts(customerId);
  const { data: loans } = useCustomerLoans(customerId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-4 w-24" />
        <CardSkeleton />
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <FadeIn>
        <div className="card-premium p-16 text-center">
          <User className="mx-auto h-10 w-10 text-navy-200" />
          <p className="mt-4 text-navy-500">Customer not found</p>
          <Link href="/customers" className="mt-4 inline-block text-sm font-semibold text-navy-900 hover:text-navy-700">&larr; Back</Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Customers
      </Link>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-premium p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">
                  {customer.first_name} {customer.last_name}
                </h1>
                <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(customer.kyc_status)}`}>
                  {customer.kyc_status}
                </span>
              </div>
            </div>
          </div>
          <div className="divider-gradient my-6" />
          <div className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-navy-400" />
              <div>
                <p className="text-xs text-navy-400">Email</p>
                <p className="text-sm font-medium text-navy-900">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-navy-400" />
              <div>
                <p className="text-xs text-navy-400">CNIC</p>
                <p className="font-mono text-sm font-medium text-navy-900">{customer.cnic}</p>
              </div>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-navy-400" />
                <div>
                  <p className="text-xs text-navy-400">Phone</p>
                  <p className="text-sm font-medium text-navy-900">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-navy-400" />
                <div>
                  <p className="text-xs text-navy-400">Address</p>
                  <p className="text-sm font-medium text-navy-900">{customer.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Landmark className="h-4 w-4 text-navy-400" />
              <div>
                <p className="text-xs text-navy-400">Registered</p>
                <p className="text-sm font-medium text-navy-900">{formatDate(customer.created_at)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </FadeIn>

      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Accounts ({accounts?.length ?? 0})</h2>
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((acct) => (
            <StaggerItem key={acct.account_id}>
              <motion.div whileHover={{ y: -3 }}>
                <Link href={`/accounts/${acct.account_id}`}
                  className="group card-premium p-5 block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Landmark className="h-5 w-5 text-navy-400 group-hover:text-navy-900 transition-colors" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900 capitalize">
                          {acct.account_type.toLowerCase().replace("_", " ")}
                        </p>
                        <p className="font-mono text-xs text-navy-500">{acct.account_number}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-navy-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <p className="mt-4 text-xl font-bold text-navy-900">{formatCurrency(Number(acct.balance), acct.currency)}</p>
                  <span className={`mt-2 inline-block rounded-lg border px-2 py-0.5 text-xs font-medium ${getStatusColor(acct.status)}`}>
                    {acct.status}
                  </span>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
          {(!accounts || accounts.length === 0) && (
            <p className="col-span-full text-sm text-navy-400">No accounts</p>
          )}
        </StaggerGrid>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Loans ({loans?.length ?? 0})</h2>
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loans?.map((loan) => (
            <StaggerItem key={loan.loan_id}>
              <motion.div whileHover={{ y: -3 }}>
                <Link href={`/loans/${loan.loan_id}`}
                  className="group card-premium p-5 block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HandCoins className="h-5 w-5 text-navy-400 group-hover:text-navy-900 transition-colors" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900 capitalize">{loan.loan_type.toLowerCase()} Loan</p>
                        <p className="text-xs text-navy-500">{loan.tenure_months} months</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-navy-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <p className="mt-4 text-xl font-bold text-navy-900">{formatCurrency(Number(loan.principal_amount))}</p>
                  <span className={`mt-2 inline-block rounded-lg border px-2 py-0.5 text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
          {(!loans || loans.length === 0) && (
            <p className="col-span-full text-sm text-navy-400">No loans</p>
          )}
        </StaggerGrid>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
