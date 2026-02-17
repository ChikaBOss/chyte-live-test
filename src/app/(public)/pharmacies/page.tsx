"use client";

import React, { useEffect, useState } from "react";
import PharmacyCard from "@/components/PharmacyCard";
import { motion } from "framer-motion";

/* ================= TYPES ================= */

type Pharmacy = {
  _id: string;
  pharmacyName: string;
  businessName?: string;
  ownerName?: string;
  email: string;
  phone?: string;
  // UPDATED: Replace address with pickup fields
  pickupZone?: string;
  pickupAddress?: string;
  pickupPhone?: string;
  logoUrl?: string;
  category?: string;
  specialties?: string;
  approved?: boolean;
  rating?: number;
  minOrder?: number;
  available?: boolean;
};

/* ================= ANIMATION ================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/* ================= PAGE ================= */

const PharmacyPage = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPharmacies() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/pharmacies/approved", {
          cache: "no-store",
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setPharmacies(data);
      } catch (err: any) {
        console.error("Load pharmacies error:", err);
        setError(err.message || "Failed to load pharmacies");
      } finally {
        setLoading(false);
      }
    }

    loadPharmacies();
  }, []);

  // Map to the exact props PharmacyCard expects
  const mappedPharmacies = pharmacies
    .filter(p => p.approved !== false)
    .map(p => ({
      id: p._id,
      name: p.pharmacyName || p.businessName || "Unknown Pharmacy",
      image: p.logoUrl || "/images/pharmacy-placeholder.jpg",
      specialty: p.category || "Pharmacy & Healthcare",
      // UPDATED: Use pickupZone for location (not address)
      location: p.pickupZone || "Pickup location not specified",
      pickupAddress: p.pickupAddress,
      pickupPhone: p.pickupPhone,
      rating: typeof p.rating === "number" ? p.rating : 0,
      minOrder: p.minOrder,
      available: p.available ?? true,
      raw: p,
    }));

  if (loading) {
    return (
      <main className="py-12 px-6 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-dark mb-8">Approved Pharmacies</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard mx-auto" />
          <p className="text-center text-dark mt-4">Loading pharmacies...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-12 px-6 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-dark mb-8">Approved Pharmacies</h1>
          <div className="text-red-600">{error}</div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-mustard text-cream rounded-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8 text-center">
          Approved Pharmacies ({mappedPharmacies.length}) 🏥
        </h1>

        {mappedPharmacies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h2 className="text-2xl font-bold text-dark mb-2">No Pharmacies Available</h2>
            <p className="text-dark mb-6">
              There are currently no approved pharmacies in your area.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-mustard text-cream rounded-full"
            >
              Check Again
            </button>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {mappedPharmacies.map((pharmacy) => (
              <motion.div
                key={pharmacy.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <PharmacyCard
                  id={pharmacy.id}
                  name={pharmacy.name}
                  image={pharmacy.image}
                  specialty={pharmacy.specialty}
                  location={pharmacy.location}
                  pickupAddress={pharmacy.pickupAddress}
                  pickupPhone={pharmacy.pickupPhone}
                  rating={pharmacy.rating}
                  minOrder={pharmacy.minOrder}
                  available={pharmacy.available}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default PharmacyPage;