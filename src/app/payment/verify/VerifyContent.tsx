'use client';

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("reference");

  useEffect(() => {
    if (!reference) return;

    async function verify() {
      const res = await fetch(`/api/payments/verify?reference=${reference}`);
      const data = await res.json();

      if (data.success) {
        router.push(`/orders/${data.orderId}?status=paid`);
      } else {
        alert("Payment verification failed");
      }
    }

    verify();
  }, [reference, router]);

  return <p className="p-10 text-center">Verifying payment...</p>;
}