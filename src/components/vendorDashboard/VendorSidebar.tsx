"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendorSidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname();
  const [vendorData, setVendorData] = useState({
    name: "Vendor Name",
    email: "vendor@example.com",
    profileImage: "/images/vendor-placeholder.jpg",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("vendorProfile");
    if (savedData) {
      setVendorData(JSON.parse(savedData));
    }
  }, []);

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const navLinks = [
    { name: "Overview", href: "/vendorDashboard" },
    { name: "Orders", href: "/vendorDashboard/orders" },
    { name: "Products", href: "/vendorDashboard/products" },
    { name: "Earnings", href: "/vendorDashboard/earnings" },
    { name: "payouts", href: "/vendorDashboard/payouts" },
    { name: "Settings", href: "/vendorDashboard/settings" },
  ];

  return (
    <aside className="h-full w-full bg-gray-900 text-white p-4 flex flex-col">
      {/* Header with title and close button (visible only on mobile) */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Vendor Panel</h1>
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

      {/* Vendor profile */}
      <div className="flex flex-col items-center text-center mb-6">
        <img
          src={vendorData.profileImage}
          alt="Vendor"
          className="w-20 h-20 rounded-full object-cover mb-2"
        />
        <h2 className="text-lg font-semibold">{vendorData.name}</h2>
        <p className="text-sm text-gray-400">{vendorData.email}</p>
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