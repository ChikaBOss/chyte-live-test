"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
    if (!raw) {
      router.replace("/admin/login");
      return;
    }
    try {
      const auth = JSON.parse(raw);
      if (!auth?.email) {
        localStorage.removeItem("adminAuth");
        router.replace("/admin/login");
        return;
      }
    } catch {
      localStorage.removeItem("adminAuth");
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream text-dark">
        <div className="animate-pulse text-sm">Loading admin…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}