"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendorSidebar() {
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

  const navLinks = [
    { name: "Overview", href: "/vendorDashboard" },
    { name: "Orders", href: "/vendorDashboard/orders" },
    { name: "Products", href: "/vendorDashboard/products" },
    { name: "Earnings", href: "/vendorDashboard/earnings" },
    { name: "Settings", href: "/vendorDashboard/settings" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
      {/* Vendor profile */}
      <div className="flex flex-col items-center text-center">
        <img
          src={vendorData.profileImage}
          alt="Vendor"
          className="w-20 h-20 rounded-full object-cover mb-2"
        />
        <h2 className="text-lg font-semibold">{vendorData.name}</h2>
        <p className="text-sm text-gray-400">{vendorData.email}</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mt-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded ${
              pathname === link.href
                ? "bg-green-600"
                : "hover:bg-gray-700"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}