'use client';

import { useEffect, useState } from "react";
import VendorCard from "@/components/VendorCard";

interface ApiVendor {
  _id: string;
  businessName: string;
  ownerName: string;
  logoUrl?: string;
  category?: string;
  pickupZone?: string;
  pickupAddress?: string;
  pickupPhone?: string;
  rating?: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendors() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/vendors");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load vendors");
        }

        const data: ApiVendor[] = await res.json();

        // Map vendor data to match VendorCard props
        const mapped = data.map(v => ({
          id: v._id,
          name: v.businessName || "Food Vendor",
          image: v.logoUrl || "/images/vendor-placeholder.jpg",
          category: v.category || "Food Vendor",
          // UPDATED: Use pickupZone for location (not address)
          location: v.pickupZone || "Pickup location not specified",
          rating: typeof v.rating === "number" ? v.rating : 0,
          // Add pickup details for tooltip or future use
          pickupZone: v.pickupZone,
          pickupAddress: v.pickupAddress,
          pickupPhone: v.pickupPhone,
        }));

        setVendors(mapped);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-6 bg-cream min-h-screen text-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-mustard mx-auto" />
        <p className="mt-4">Loading vendors…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-6 bg-cream min-h-screen text-center text-red-600">
        {error}
      </section>
    );
  }

  return (
    <section className="py-12 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Verified Food Vendors ({vendors.length})
        </h1>
        <p className="text-lg mb-8">
          Discover trusted vendors offering meals around FUTO.
        </p>

        {vendors.length === 0 ? (
          <p className="text-center text-gray-500">No verified vendors yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {vendors.map(v => (
              <VendorCard key={v.id} {...v} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}