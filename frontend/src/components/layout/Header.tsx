"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex h-16 items-center justify-between gap-4 border-b border-border bg-white backdrop-blur-md px-4 lg:px-6"
    >
      <button
        onClick={toggleSidebar}
        className="lg:hidden touch-target flex items-center justify-center rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-all"
        aria-label="Toggle sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />
      {user && (
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-navy-900">
                {user.firstName ?? "User"}
              </p>
              <p className="text-xs text-navy-600 capitalize tracking-wide">{(user.role ?? "customer").toLowerCase().replace("_", " ")}</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="touch-target flex items-center justify-center rounded-lg bg-navy-900 text-sm font-semibold text-white shadow-sm"
            >
              {(user.firstName ?? "U")[0]}
            </motion.div>
          </div>
        </div>
      )}
    </motion.header>
  );
}
