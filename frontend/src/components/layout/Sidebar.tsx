"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";
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
  { label: "Support", href: "/support", icon: <HelpCircle className="h-4 w-4" />, roles: ["CUSTOMER", "TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] },
];

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: { duration: 0.2, ease: easeOut },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.04, duration: 0.25, ease: easeOut },
  }),
};

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useSidebarStore((s) => s.sidebarOpen);
  const setSidebarOpen = useSidebarStore((s) => s.setSidebarOpen);
  const role = user?.role ?? "CUSTOMER";

  const visibleItems = allNavItems.filter((item) => item.roles.includes(role));

  const handleNav = () => {
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-sidebar-border">
        <Link href="/" onClick={handleNav} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm group-hover:opacity-80 transition-opacity">
            <Landmark className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground group-hover:opacity-80 transition-opacity" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>EasyTrust</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-5">
        {visibleItems.map((item, idx) => {
          const active = pathname.startsWith(item.href);
          return (
            <motion.div
              key={item.href}
              custom={idx}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={item.href}
                onClick={handleNav}
                className={`touch-target flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-navy-100 text-navy-900 shadow-sm"
                    : "text-muted-foreground hover:bg-navy-50 hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => { onLogout(); setSidebarOpen(false); }}
          className="touch-target flex w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-navy-50 hover:text-foreground transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sidebarVariants}
              className="relative h-full w-60 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
