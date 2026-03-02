"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export function RiderSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { name: "Dashboard", path: "/riderDashboard", icon: "📊" },
    { name: "Deliveries", path: "/riderDashboard/deliveries", icon: "🚗", badge: 3 },
    { name: "Earnings", path: "/riderDashboard/earnings", icon: "💰" },
    { name: "Payouts", path: "/riderDashboard/payouts", icon: "💸" },
    { name: "History", path: "/riderDashboard/history", icon: "📋" },
    { name: "Performance", path: "/riderDashboard/performance", icon: "📈" },
    { name: "Delivery Pricing", path: "/riderDashboard/delivery-pricing", icon: "📝" },
    { name: "Profile", path: "/riderDashboard/profile", icon: "👤" },
    // 👇 NEW SETTINGS LINK
    { name: "Settings", path: "/riderDashboard/settings", icon: "⚙️" },
  ];

  const handleLinkClick = () => {
    onClose(); // Close sidebar after navigation on mobile
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
          w-64 lg:w-64
          bg-dark shadow-xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:transform-none lg:translate-x-0
        `}
      >
        {/* Header with close button */}
        <div className="p-6 border-b border-mustard flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cream">Rider Dashboard</h1>
            <p className="text-cream/70 text-sm mt-1">Welcome back, Rider! 👋</p>
          </div>
          {/* Close button (visible only on mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-cream hover:bg-mustard/30"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-mustard">
          <div className="bg-mustard/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-cream text-sm">Today's Earnings</span>
              <span className="text-green font-bold">₦3,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cream text-sm">Completed</span>
              <span className="text-olive font-bold">5/8</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.path} onClick={handleLinkClick}>
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-green text-cream shadow-lg"
                        : "text-cream hover:bg-mustard/30 hover:text-cream"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-cream text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-mustard">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-mustard/20">
            <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center text-cream font-bold flex-shrink-0">
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-cream font-medium truncate">Rider Status</p>
              <p className="text-olive text-sm">🟢 Online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}