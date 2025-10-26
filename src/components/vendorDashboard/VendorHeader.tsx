// components/vendorDashboard/VendorHeader.tsx
"use client";

import Image from "next/image";

interface VendorHeaderProps {
  vendorName?: string;
  profileImage?: string;
}

export default function VendorHeader({
  vendorName = "John Doe",
  profileImage = "/default-avatar.png",
}: VendorHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4 mb-6 rounded-lg">
      <h2 className="text-xl font-semibold">Welcome, {vendorName}</h2>
      <div className="flex items-center gap-3">
        <Image
          src={profileImage}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>
    </header>
  );
}