"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function RiderSidebar({ onClose }) { // Remove isOpen prop
  const pathname = usePathname();
  
  const menuItems = [
    { name: "Dashboard", path: "/riderDashboard"},
    { name: "Deliveries", path: "/riderDashboard/deliveries", icon: "🚗", badge: 3 },
    { name: "Earnings", path: "/riderDashboard/earnings", icon: "💰" },
    { name: "History", path: "/riderDashboard/history", icon: "📋" },
    { name: "Profile", path: "/riderDashboard/profile", icon: "👤" },
    { name: "Performance", path: "/riderDashboard/performance", icon: "📊" },
  ];

  return (
    <div className="fixed lg:static inset-y-0 left-0 z-50 w-80 bg-dark shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-mustard">
        <h1 className="text-2xl font-bold text-cream">Rider Dashboard</h1>
        <p className="text-cream/70 text-sm mt-1">Welcome back, Rider! 👋</p>
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
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.path} onClick={onClose}>
                <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-green text-cream shadow-lg transform scale-105" 
                    : "text-cream/80 hover:bg-mustard/30 hover:text-cream"
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-cream text-xs rounded-full w-6 h-6 flex items-center justify-center">
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
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-mustard">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-mustard/20">
          <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center text-cream font-bold">
            R
          </div>
          <div>
            <p className="text-cream font-medium">Rider Status</p>
            <p className="text-olive text-sm">🟢 Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}