"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ChefSidebar from "@/components/chefDashboard/ChefSidebar";

export default function ChefDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/chefs/login");
      return;
    }

    if (session.user?.role !== "chef") {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [status, session, router]);

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