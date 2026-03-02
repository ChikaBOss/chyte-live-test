"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PharmacySidebar from "@/components/pharmacyDashboard/PharmacySidebar";

export default function PharmacyDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

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
    <div className="min-h-screen flex relative">
      {/* Backdrop - only on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container - half width on mobile, fixed width on desktop */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          w-1/2 md:w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <PharmacySidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 bg-gray-100">
        {/* Mobile header with hamburger */}
        <div className="md:hidden bg-white border-b p-4 flex items-center sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="ml-4 text-xl font-bold">Pharmacy Panel</h1>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}