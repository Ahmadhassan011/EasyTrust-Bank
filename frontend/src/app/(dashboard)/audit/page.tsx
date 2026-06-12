"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/useApi";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { ScrollText, Search } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { Select } from "@/components/ui/form-field";

const entityTypes = ["", "CUSTOMER", "ACCOUNT", "TRANSACTION", "LOAN", "LOAN_REPAYMENT", "INTERBANK_TRANSFER"];
const actions = ["", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "TRANSFER", "DEPOSIT", "WITHDRAWAL", "REPAY", "MFA_SETUP", "MFA_ENABLE", "MFA_DISABLE"];

export default function AuditPage() {
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    startDate: "",
    endDate: "",
    limit: 50,
    offset: 0,
  });

  const { data: logs, isLoading } = useAuditLogs(filters);

  function update(field: string, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value, offset: 0 }));
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100">
            <Search className="h-5 w-5 text-navy-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Audit Log</h1>
            <p className="text-sm text-navy-500">Immutable trail of all employee actions.</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-wrap gap-3 card-premium p-4">
          <Select value={filters.entityType} onChange={(e) => update("entityType", e.target.value)}>
            <option value="">All entity types</option>
            {entityTypes.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={filters.action} onChange={(e) => update("action", e.target.value)}>
            <option value="">All actions</option>
            {actions.filter(Boolean).map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <input type="date" value={filters.startDate} onChange={(e) => update("startDate", e.target.value)}
            className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-700 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all" />
          <input type="date" value={filters.endDate} onChange={(e) => update("endDate", e.target.value)}
            className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-700 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all" />
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="overflow-hidden rounded-xl border border-navy-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-200 bg-navy-50">
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Date</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Employee</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Entity</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Action</th>
                <th className="px-5 py-3.5 text-left font-semibold text-navy-600">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-navy-400">Loading...</td></tr>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.log_id} className="border-b border-navy-100 last:border-0 hover:bg-navy-50/50 transition-colors">
                    <td className="px-5 py-3 text-navy-600 whitespace-nowrap">{formatDateTime(log.logged_at)}</td>
                    <td className="px-5 py-3 text-navy-700">{log.employee_id ? `#${log.employee_id}` : "System"}</td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-navy-900">{log.entity_type}</span>
                      <span className="text-navy-500"> #{log.entity_id}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-navy-500">{log.ip_address ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-navy-400">
                  <ScrollText className="mx-auto h-8 w-8" />
                  <p className="mt-3 font-medium">No audit logs found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  );
}
