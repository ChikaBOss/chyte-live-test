"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to login page without session
    if (pathname === '/admin/login') return;

    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.replace('/admin/login');
    }
  }, [session, status, router, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream text-dark">
        <div className="animate-pulse text-sm">Loading admin…</div>
      </div>
    );
  }

  return <>{children}</>;
}