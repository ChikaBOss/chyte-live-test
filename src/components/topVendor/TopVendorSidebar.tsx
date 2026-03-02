"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface TopVendorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Item = { label: string; href: string; icon: string };

const items: Item[] = [
  { label: "Overview", href: "/topVendorDashboard", icon: "📊" },
  { label: "Orders", href: "/topVendorDashboard/orders", icon: "📦" },
  { label: "Products", href: "/topVendorDashboard/products", icon: "🛍️" },
  { label: "Earnings", href: "/topVendorDashboard/earnings", icon: "💰" },
  { label: "Payouts", href: "/topVendorDashboard/payouts", icon: "💳" },
  { label: "Settings", href: "/topVendorDashboard/settings", icon: "⚙️" },
];

export default function TopVendorSidebar({ isOpen, onClose }: TopVendorSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/topVendorDashboard" && pathname?.startsWith(href));

  const handleLinkClick = () => {
    onClose(); // close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-1/2 lg:w-64
          bg-olive text-cream shadow-xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:transform-none lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-5 border-b border-cream/20 justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center mr-3">
              <span className="text-olive text-lg font-bold">TV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Top Vendor</h1>
              <span className="text-xs rounded bg-cream/20 text-cream px-2 py-0.5">
                5% fee
              </span>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-cream hover:bg-cream/20"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
          {items.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all relative overflow-hidden
                  ${active ? "bg-cream text-olive font-semibold" : "hover:bg-cream/10"}`}
              >
                {active && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-cream rounded-r-full" />
                )}
                <span className="text-lg">{it.icon}</span>
                <span>{it.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-green" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-cream/20">
          <button
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
          </button>
        </div>
      </aside>
    </>
  );
}