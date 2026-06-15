"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Landmark, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/support/faq", label: "Support" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 80],
    ["rgba(11,31,59,0)", "rgba(11,31,59,0.95)"]
  );

  return (
    <motion.header
      style={{ background: headerBg }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Landmark className="h-4 w-4 text-navy-900" />
          </div>
          <span
            className="text-lg font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            EasyTrust
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all text-white/60 hover:text-white ${
                pathname === link.href ? "text-white font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4 flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition-all shadow-lg shadow-white/20"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition-all shadow-lg shadow-white/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden touch-target flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-navy-900 backdrop-blur-md">
          <div className="px-6 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`touch-target flex items-center rounded-lg px-4 text-sm font-medium transition-all text-white/60 hover:text-white hover:bg-white/10 ${
                  pathname === link.href ? "text-white font-semibold bg-white/5" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-white/10 my-2" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="touch-target flex items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition-all"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                Go to Dashboard
              </Link>
            ) : (
              <div className="space-y-1 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="touch-target flex items-center rounded-lg px-4 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="touch-target flex items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}
