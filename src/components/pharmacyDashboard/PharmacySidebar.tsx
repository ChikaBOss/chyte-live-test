"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PharmacySidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/pharmacyDashboard" },
    { name: "Orders", href: "/pharmacyDashboard/orders" },
    { name: "Products", href: "/pharmacyDashboard/products" },
    { name: "Earnings", href: "/pharmacyDashboard/earnings" },
    { name: "Settings", href: "/pharmacyDashboard/settings" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pharmacy Panel</h1>
      <nav className="space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded ${
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