"use client";

import { type LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, icon: Icon, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-700">
        {Icon && <Icon className="mr-1.5 inline h-3.5 w-3.5 text-navy-400" />}
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`block w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`block w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`block w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all resize-none ${className}`}
      {...props}
    />
  );
}
