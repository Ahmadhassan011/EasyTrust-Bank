"use client";

import { motion } from "framer-motion";
import { useCustomers } from "@/hooks/useApi";
import Link from "next/link";
import { Users, Plus, ArrowUpRight } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-40" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="overflow-hidden rounded-xl border border-navy-200 bg-white">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-navy-100 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-navy-400">Directory</p>
            <h1 className="text-2xl font-bold text-navy-900">Customers</h1>
            <p className="mt-0.5 text-sm text-navy-400">{customers?.length ?? 0} registered</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/customers/create"
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">
              <Plus className="h-4 w-4" />
              New Customer
            </Link>
          </motion.div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="overflow-hidden rounded-xl border border-navy-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-200 bg-navy-50">
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Name</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">CNIC</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Email</th>
                <th className="px-5 py-3.5 text-center font-semibold text-navy-600">KYC</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Created</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {customers?.map((customer, idx) => (
                <motion.tr
                  key={customer.customer_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  className="border-b border-navy-100 last:border-0 hover:bg-navy-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/customers/${customer.customer_id}`}
                      className="font-semibold text-navy-900 hover:text-navy-700 transition-colors">
                      {customer.first_name} {customer.last_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-navy-600">{customer.cnic}</td>
                  <td className="px-5 py-3.5 text-navy-600">{customer.email}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(customer.kyc_status)}`}>
                      {customer.kyc_status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-navy-500">{formatDate(customer.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/customers/${customer.customer_id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-navy-400 hover:text-navy-900 transition-colors">
                      View <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {(!customers || customers.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-navy-400">
                    <Users className="mx-auto h-8 w-8" />
                    <p className="mt-3 font-medium">No customers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
