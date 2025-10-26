"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Item = { label: string; href: string; icon: string };

const items: Item[] = [
  { label: "Overview", href: "/topVendorDashboard", icon: "📊" },
  { label: "Orders", href: "/topVendorDashboard/orders", icon: "📦" },
  { label: "Products", href: "/topVendorDashboard/products", icon: "🛍️" },
  { label: "Earnings", href: "/topVendorDashboard/earnings", icon: "💰" },
  { label: "Payouts", href: "/topVendorDashboard/payouts", icon: "💳" },
  { label: "Settings", href: "/topVendorDashboard/settings", icon: "⚙️" },
];

export default function TopVendorSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/topVendorDashboard" && pathname?.startsWith(href));

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="flex h-full w-64 flex-col bg-olive text-cream shadow-xl"
    >
      {/* Brand */}
      <div className="h-20 flex items-center px-5 border-b border-cream/20">
        <div className="flex items-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-10 h-10 rounded-full bg-cream flex items-center justify-center mr-3"
          >
            <span className="text-olive text-lg font-bold">TV</span>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold">Top Vendor</h1>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs rounded bg-cream/20 text-cream px-2 py-0.5"
            >
              5% fee
            </motion.span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
        {items.map((it, index) => {
          const active = isActive(it.href);
          return (
            <motion.div
              key={it.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link
                href={it.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all relative overflow-hidden
                  ${active ? "bg-cream text-olive font-semibold" : "hover:bg-cream/10"}`}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 4 }}
                      exit={{ width: 0 }}
                      className="absolute left-0 top-0 h-full bg-cream rounded-r-full"
                    />
                  )}
                </AnimatePresence>
                <span className="text-lg">{it.icon}</span>
                <span>{it.label}</span>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 rounded-full bg-green"
                    />
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-4 border-t border-cream/20"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            localStorage.removeItem("topVendorAuth");
            location.href = "/topVendor/login";
          }}
          className="w-full rounded-xl bg-green px-4 py-3 text-sm font-medium text-cream hover:bg-green/90 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}