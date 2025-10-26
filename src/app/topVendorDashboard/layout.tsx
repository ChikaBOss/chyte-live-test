"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopVendorSidebar from "@/components/topVendor/TopVendorSidebar";

export default function TopVendorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // auth: require topVendorAuth
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("topVendorAuth") : null;
    if (!raw) {
      router.replace("/topVendor/login");
      return;
    }
    try {
      const auth = JSON.parse(raw);
      if (!auth?.vendorId) {
        localStorage.removeItem("topVendorAuth");
        router.replace("/topVendor/login");
        return;
      }
      setReady(true);
    } catch {
      localStorage.removeItem("topVendorAuth");
      router.replace("/topVendor/login");
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream text-dark">
        <div className="animate-pulse text-sm">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <TopVendorSidebar />
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="h-16 px-4 flex items-center justify-between border-b bg-white">
          <button className="lg:hidden rounded p-2 hover:bg-gray-100" onClick={() => setOpen(true)}>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-semibold">Top Vendor Dashboard</h1>
          <div />
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}