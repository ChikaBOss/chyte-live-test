"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PharmacySidebar from "@/components/pharmacyDashboard/PharmacySidebar";

export default function PharmacyDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authRaw = typeof window !== "undefined" ? localStorage.getItem("pharmacyAuth") : null;

    if (!authRaw) {
      router.replace("/pharmacy/login");
      return;
    }

    try {
      const auth = JSON.parse(authRaw);
      if (!auth?.pharmacyId) {
        localStorage.removeItem("pharmacyAuth");
        router.replace("/pharmacy/login");
        return;
      }
    } catch {
      localStorage.removeItem("pharmacyAuth");
      router.replace("/pharmacy/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream text-dark">
        <div className="animate-pulse text-sm">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <PharmacySidebar />
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}