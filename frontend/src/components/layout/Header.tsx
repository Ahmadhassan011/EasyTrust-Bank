"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex h-16 items-center justify-end gap-4 border-b border-navy-100 bg-white/80 backdrop-blur-md px-6"
    >
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-navy-900">
              {user.firstName ?? "User"}
            </p>
            <p className="text-xs text-navy-400">{user.role}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-sm font-semibold text-white shadow-sm"
          >
            {(user.firstName ?? "U")[0]}
          </motion.div>
        </div>
      )}
    </motion.header>
  );
}
