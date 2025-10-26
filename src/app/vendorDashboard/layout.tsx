// src/app/vendorDashboard/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VendorSidebar from "@/components/vendorDashboard/VendorSidebar";

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false); // avoid flash during auth check

  useEffect(() => {
    // read fake session from localStorage (set in /vendor/login)
    const authRaw = typeof window !== "undefined" ? localStorage.getItem("vendorAuth") : null;

    if (!authRaw) {
      router.replace("/vendor/login"); // not logged in → bounce to login
      return;
    }

    // (Optional) validate shape
    try {
      const auth = JSON.parse(authRaw);
      if (!auth?.vendorId) {
        localStorage.removeItem("vendorAuth");
        router.replace("/vendor/login");
        return;
      }
    } catch {
      localStorage.removeItem("vendorAuth");
      router.replace("/vendor/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    // simple loading state while we decide where to send the user
    return (
      <div className="min-h-screen grid place-items-center bg-cream text-dark">
        <div className="animate-pulse text-sm">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <VendorSidebar />
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}