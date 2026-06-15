"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";

type Category = "All" | "Accounts" | "Transactions" | "Loans" | "Security";

interface Faq {
  category: Category;
  q: string;
  a: string;
}

const faqs: Faq[] = [
  // Accounts
  {
    category: "Accounts",
    q: "How do I open an account with EasyTrust?",
    a: "Visit any EasyTrust branch with your original CNIC and a recent passport-size photograph, or register online through our portal. Once your KYC is verified, a Teller will set up your account and provide your account number. Initial minimum deposit requirements vary by account type.",
  },
  {
    category: "Accounts",
    q: "What types of accounts does EasyTrust offer?",
    a: "We offer three account types: Savings (competitive profit rates, monthly statements), Checking (everyday transactions, no minimum balance), and Fixed Deposit (locked-in tenure with higher profit rates). All accounts are maintained in PKR.",
  },
  {
    category: "Accounts",
    q: "What documents are required to open an account?",
    a: "You will need a valid CNIC (National Identity Card), a recent passport-size photograph, and proof of address. For business accounts, additional documents such as business registration certificates are required.",
  },
  {
    category: "Accounts",
    q: "What are the daily transaction limits?",
    a: "Default daily limits depend on your account type and are displayed on your Account Details page inside the portal. You can request a limit increase by visiting your branch manager or contacting our helpline.",
  },
  {
    category: "Accounts",
    q: "How do I close or freeze my account?",
    a: "To close an account, visit any EasyTrust branch in person with your CNIC. To temporarily freeze your account, call our 24/7 helpline at 0800-12345 or ask your branch. A frozen account cannot send or receive funds until reinstated.",
  },

  // Transactions
  {
    category: "Transactions",
    q: "How do I transfer funds to another EasyTrust account?",
    a: "Log in to your online banking portal, go to Transactions → Transfer, enter the recipient's account number and the amount, then confirm. Transfers between EasyTrust accounts are instant and free of charge.",
  },
  {
    category: "Transactions",
    q: "Can I transfer money to accounts at other banks?",
    a: "Yes. EasyTrust supports interbank transfers through Pakistan's Raast instant payment network. Go to Interbank → Transfer, provide the recipient's account number and bank SWIFT code, and submit. Transfers are typically settled within minutes.",
  },
  {
    category: "Transactions",
    q: "What is the Raast network?",
    a: "Raast is Pakistan's first instant payment system launched by the State Bank of Pakistan. It enables real-time fund transfers between participating banks and financial institutions using account numbers — no additional identifier needed.",
  },
  {
    category: "Transactions",
    q: "How do I view my transaction history?",
    a: "Navigate to Accounts, select an account, and open the Statements tab. You can filter by date range and download a printable statement. Individual transaction receipts are also available under Transactions → Receipt.",
  },
  {
    category: "Transactions",
    q: "What happens if a transfer fails?",
    a: "If a transfer fails after funds are debited, a compensating refund is automatically applied to your account within minutes. If the balance is not restored within one hour, contact our helpline immediately at 0800-12345.",
  },

  // Loans
  {
    category: "Loans",
    q: "How do I apply for a loan?",
    a: "Log in, go to Loans → Apply, select your loan type (Personal, Home, Auto, or Education), and fill in the amount, tenure, and purpose. Your application will be reviewed by a Loan Officer who will approve or reject it within 2–5 business days.",
  },
  {
    category: "Loans",
    q: "How is my loan EMI calculated?",
    a: "EMIs are calculated using the Reducing Balance (diminishing rate) method: EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1), where P is the principal, r is the monthly interest rate, and n is the tenure in months. The breakdown of principal and interest is shown on each repayment receipt.",
  },
  {
    category: "Loans",
    q: "What loan types are available?",
    a: "EasyTrust offers Personal Loans (general expenses), Home Loans (property purchase or construction), Auto Loans (vehicle financing), and Education Loans (tuition and related fees). Minimum and maximum amounts vary by type.",
  },
  {
    category: "Loans",
    q: "How do I make a loan repayment?",
    a: "Go to Loans, select your active loan, and click Make Repayment. Each payment is split automatically into principal and interest components and linked to a transaction record. You can view the remaining balance and repayment schedule at any time.",
  },

  // Security
  {
    category: "Security",
    q: "What should I do if I lose my debit card?",
    a: "Call our 24/7 helpline at 0800-12345 immediately to block your card. Our agent will freeze the card to prevent unauthorized transactions. Visit your nearest branch with your CNIC to request a replacement card.",
  },
  {
    category: "Security",
    q: "How do I reset my password?",
    a: "For security, self-service password reset is not available online. Contact your branch manager or call our helpline at 0800-12345. An administrator will verify your identity and reset your credentials securely.",
  },
  {
    category: "Security",
    q: "What is MFA and should I enable it?",
    a: "Multi-Factor Authentication (MFA) adds a time-based one-time password (TOTP) layer — generated by an authenticator app — on top of your regular login. It is mandatory for all bank employees and strongly recommended for customers. Set it up under Settings → MFA.",
  },
  {
    category: "Security",
    q: "Are my deposits protected?",
    a: "Yes. EasyTrust Bank is regulated by the State Bank of Pakistan. Customer deposits are protected under the Deposit Protection Corporation (DPC) scheme up to the applicable statutory limit per depositor per institution.",
  },
];

const categories: Category[] = ["All", "Accounts", "Transactions", "Loans", "Security"];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = activeCategory === "All"
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="max-w-2xl"
          >
            <span className="serial-number text-navy-400">FAQ</span>
            <h1
              className="mt-3 text-4xl sm:text-5xl text-white"
              style={{ fontFamily: "var(--font-display)", fontWeight: 480 }}
            >
              Frequently asked questions
            </h1>
            <p className="mt-4 text-lg text-navy-300 leading-relaxed max-w-xl">
              Quick answers about accounts, transfers, loans, and security.
              Can't find what you need? Our team is one message away.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* FAQ body */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">

          {/* Category filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="flex flex-wrap gap-2 mb-10"
            role="tablist"
            aria-label="FAQ categories"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-navy-900 text-white shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Accordion list */}
          <div className="space-y-3" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="space-y-3"
              >
                {filtered.map((faq, i) => (
                  <motion.div
                    key={`${faq.category}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35, ease: easeOut }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      aria-expanded={openIndex === i}
                      className="flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/40"
                    >
                      <span className="flex-1 font-medium text-foreground leading-snug">{faq.q}</span>
                      <motion.span
                        animate={{ rotate: openIndex === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {openIndex === i && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: easeOut }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border px-6 py-5">
                            <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Still have questions CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            className="mt-14 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-foreground">
              Still have questions?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Our support team is available 24/7. Send us a message and we will respond within one business day.
            </p>
            <Link
              href="/support/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-lg touch-target bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
