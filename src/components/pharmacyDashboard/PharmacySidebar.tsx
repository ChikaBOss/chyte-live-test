"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PharmacySidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const navLinks = [
    { name: "Overview", href: "/pharmacyDashboard" },
    { name: "Orders", href: "/pharmacyDashboard/orders" },
    { name: "Products", href: "/pharmacyDashboard/products" },
    { name: "Earnings", href: "/pharmacyDashboard/earnings" },
    { name: "Settings", href: "/pharmacyDashboard/settings" },
  ];

  return (
    <aside className="h-full w-full bg-gray-900 text-white p-4 flex flex-col">
      {/* Header with title and close button (visible only on mobile) */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pharmacy Panel</h1>
        {closeSidebar && (
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 rounded-md hover:bg-gray-700"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={handleLinkClick}
            className={`block px-3 py-2 rounded transition ${
              pathname === link.href ? "bg-green-600" : "hover:bg-gray-700"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}