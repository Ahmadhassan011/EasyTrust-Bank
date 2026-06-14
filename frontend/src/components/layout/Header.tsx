"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex h-16 items-center justify-between gap-4 border-b border-border bg-white backdrop-blur-md px-6"
    >
      <div />
      {user && (
        <div className="flex items-center gap-4">
          <button className="relative text-muted-foreground hover:text-navy-900 transition-colors p-2 rounded-lg hover:bg-navy-50" title="Updates">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-navy-900">
                {user.firstName ?? "User"}
              </p>
              <p className="text-xs text-navy-600 capitalize tracking-wide">{user.role.toLowerCase().replace("_", " ")}</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-sm font-semibold text-white shadow-sm"
            >
              {(user.firstName ?? "U")[0]}
            </motion.div>
          </div>
        </div>
      )}
    </motion.header>
  );
}
