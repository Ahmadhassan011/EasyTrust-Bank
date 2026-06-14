"use client";

import Link from "next/link";
import { Landmark, Shield, Phone, Mail } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Branches", href: "/contact" },
  ],
  banking: [
    { label: "Checking Accounts", href: "/register" },
    { label: "Savings Accounts", href: "/register" },
    { label: "Personal Loans", href: "/register" },
    { label: "Interbank Transfers", href: "/register" },
  ],
  support: [
    { label: "Help & FAQ", href: "/support/faq" },
    { label: "Contact Support", href: "/support/contact" },
    { label: "Security", href: "/support" },
  ],
};

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Security Notice", href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">

        {/* Top grid: brand + link columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="EasyTrust Bank home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 transition-colors group-hover:bg-white/25">
                <Landmark className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-base font-semibold text-white"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                EasyTrust
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-navy-300 max-w-xs">
              A distributed banking platform connecting every branch into one real-time network. Accounts, loans, and transfers — unified.
            </p>

            <div className="mt-6 space-y-2">
              <a
                href="tel:080012345"
                className="flex items-center gap-2 text-xs text-navy-400 hover:text-navy-200 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                0800-12345 (24/7 Helpline)
              </a>
              <a
                href="mailto:support@easytrustbank.com"
                className="flex items-center gap-2 text-xs text-navy-400 hover:text-navy-200 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                support@easytrustbank.com
              </a>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-400">
              Company
            </h3>
            <nav aria-label="Company links">
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Banking links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-400">
              Banking
            </h3>
            <nav aria-label="Banking services links">
              <ul className="mt-4 space-y-3">
                {footerLinks.banking.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-400">
              Support
            </h3>
            <nav aria-label="Support links">
              <ul className="mt-4 space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 flex items-start gap-2 rounded-lg border border-navy-700 bg-navy-800/50 px-3 py-2.5">
              <Shield className="h-4 w-4 shrink-0 text-navy-400 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-navy-400 leading-snug">
                256-bit AES encryption. SBP licensed and regulated.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-navy-700 to-transparent" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-navy-500">
            &copy; {year} EasyTrust Bank. All rights reserved.
          </p>
          <nav aria-label="Legal links">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-navy-500 hover:text-navy-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
