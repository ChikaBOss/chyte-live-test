"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ChefSidebar from "@/components/chefDashboard/ChefSidebar";

export default function ChefDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("chefAuth") : null;
    if (!raw) {
      router.replace("/chef/login");
      return;
    }
    try {
      const auth = JSON.parse(raw);
      if (!auth?.chefId) {
        localStorage.removeItem("chefAuth");
        router.replace("/chef/login");
        return;
      }
    } catch {
      localStorage.removeItem("chefAuth");
      router.replace("/chef/login");
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream text-dark">
        <div className="animate-pulse text-sm">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <ChefSidebar />
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}