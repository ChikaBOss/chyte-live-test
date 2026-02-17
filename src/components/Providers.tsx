// components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gets focus
    >
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}