"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Account,
  Customer,
  Transaction,
  Loan,
  InterbankTransfer,
  AuditLog,
  MonthlyReport,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Account[]>>("/accounts");
      return data.data;
    },
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Account>>(`/accounts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useAccountBalance(id: number) {
  return useQuery({
    queryKey: ["account", id, "balance"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ account_id: number; balance: number }>>(
        `/accounts/${id}/balance`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCustomerAccounts(customerId: number) {
  return useQuery({
    queryKey: ["customer", customerId, "accounts"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Account[]>>(
        `/accounts/customer/${customerId}`,
      );
      return data.data;
    },
    enabled: !!customerId,
  });
}

export function useTransactionHistory(
  accountId: number,
  params?: { limit?: number; offset?: number; startDate?: string; endDate?: string },
) {
  return useQuery({
    queryKey: ["transactions", accountId, params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transaction>>(
        `/transactions/history/${accountId}`,
        { params },
      );
      return data;
    },
    enabled: !!accountId,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Customer[]>>("/customers");
      return data.data;
    },
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCustomerLoans(customerId: number) {
  return useQuery({
    queryKey: ["customer", customerId, "loans"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Loan[]>>(`/loans/customer/${customerId}`);
      return data.data;
    },
    enabled: !!customerId,
  });
}

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Loan[]>>("/loans/customer/0");
      return data.data;
    },
  });
}

export function useAuditLogs(params?: {
  entityType?: string;
  action?: string;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["audit", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AuditLog[]>>("/audit", { params });
      return data.data;
    },
  });
}

export function useMonthlyReports(year: number, month: number) {
  return useQuery({
    queryKey: ["reports", "monthly", year, month],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MonthlyReport>>(
        "/reports/monthly-transactions",
        { params: { year, month } },
      );
      return data.data;
    },
    enabled: !!year && !!month,
  });
}

export function useCustomerDetails(id: number) {
  return useQuery({
    queryKey: ["customer", id, "details"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & Record<string, unknown>) => {
      const { data } = await api.put<ApiResponse<Customer>>(`/customers/${id}`, body);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
    },
  });
}

export function useInterbankTransfer(id: number) {
  return useQuery({
    queryKey: ["interbank", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<InterbankTransfer>>(
        `/interbank/${id}/settlement`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}
