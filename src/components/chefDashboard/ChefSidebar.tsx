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

export default function ChefSidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  return (
    <aside className="h-full w-full bg-gray-900 text-white p-4 flex flex-col">
      {/* Header with title and close button (visible only on mobile) */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chef Panel</h1>
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

      <nav className="flex-1 space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={handleLinkClick}
            className={`block px-3 py-2 rounded transition ${
              pathname === l.href ? "bg-green-600" : "hover:bg-gray-700"
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