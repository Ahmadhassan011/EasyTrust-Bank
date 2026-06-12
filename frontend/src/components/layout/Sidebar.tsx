"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import type { Role } from "@/types";
import { easeOut } from "@/components/ui/animations";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  HandCoins,
  Users,
  Building2,
  ScrollText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["CUSTOMER", "TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] },
  { label: "Accounts", href: "/accounts", icon: <Landmark className="h-4 w-4" />, roles: ["CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"] },
  { label: "Transactions", href: "/transactions/transfer", icon: <ArrowLeftRight className="h-4 w-4" />, roles: ["CUSTOMER", "TELLER", "MANAGER", "ADMIN"] },
  { label: "Loans", href: "/loans", icon: <HandCoins className="h-4 w-4" />, roles: ["CUSTOMER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] },
  { label: "Customers", href: "/customers", icon: <Users className="h-4 w-4" />, roles: ["MANAGER", "ADMIN"] },
  { label: "Interbank", href: "/interbank/transfer", icon: <Building2 className="h-4 w-4" />, roles: ["TELLER", "MANAGER", "ADMIN"] },
  { label: "Audit Log", href: "/audit", icon: <ScrollText className="h-4 w-4" />, roles: ["AUDITOR", "ADMIN"] },
  { label: "Reports", href: "/reports", icon: <BarChart3 className="h-4 w-4" />, roles: ["MANAGER", "ADMIN"] },
  { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" />, roles: ["CUSTOMER", "TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] },
  { label: "Help", href: "/help", icon: <HelpCircle className="h-4 w-4" />, roles: ["CUSTOMER", "TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] },
];

const sidebarVariants = {
  hidden: { x: -200, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: easeOut },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.04, duration: 0.3, ease: easeOut },
  }),
};

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "CUSTOMER";

  const visibleItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="flex w-60 flex-col bg-navy-900 text-white"
    >
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-white/5">
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"
        >
          <Landmark className="h-4 w-4 text-white" />
        </motion.div>
        <span className="text-lg font-bold tracking-tight">EasyTrust</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {visibleItems.map((item, idx) => {
          const active = pathname.startsWith(item.href);
          return (
            <motion.div
              key={item.href}
              custom={idx}
              variants={navItemVariants}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-3 py-4">
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </motion.button>
      </div>
    </motion.aside>
  );
}
