export function formatCurrency(amount: number, currency = "PKR"): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "text-green-600 bg-green-50 border-green-200",
    INACTIVE: "text-gray-600 bg-gray-50 border-gray-200",
    DORMANT: "text-yellow-600 bg-yellow-50 border-yellow-200",
    CLOSED: "text-red-600 bg-red-50 border-red-200",
    PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
    APPROVED: "text-blue-600 bg-blue-50 border-blue-200",
    REJECTED: "text-red-600 bg-red-50 border-red-200",
    COMPLETED: "text-green-600 bg-green-50 border-green-200",
    FAILED: "text-red-600 bg-red-50 border-red-200",
    SETTLED: "text-green-600 bg-green-50 border-green-200",
    VERIFIED: "text-green-600 bg-green-50 border-green-200",
    PAID: "text-green-600 bg-green-50 border-green-200",
    DEFAULTED: "text-red-600 bg-red-50 border-red-200",
  };
  return map[status] ?? "text-gray-600 bg-gray-50 border-gray-200";
}
