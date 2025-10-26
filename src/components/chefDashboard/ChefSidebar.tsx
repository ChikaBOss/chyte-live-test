"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Overview", href: "/chefDashboard" },
  { name: "Orders", href: "/chefDashboard/orders" },
  { name: "Meals", href: "/chefDashboard/meals" },
  { name: "Earnings", href: "/chefDashboard/earnings" },
  { name: "Settings", href: "/chefDashboard/settings" },
];

export default function ChefSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
      <h1 className="text-2xl font-bold">Chef Panel</h1>

      <nav className="space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded ${
              pathname === l.href ? "bg-green" : "hover:bg-gray-700"
            }`}
          >
            {l.name}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => {
          localStorage.removeItem("chefAuth");
          window.location.href = "/chef/login";
        }}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white rounded px-3 py-2"
      >
        Logout
      </button>
    </aside>
  );
}