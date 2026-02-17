"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TopVendorCard from "./TopVendorCard";
import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid";

type TopVendor = {
  _id: string;
  businessName: string;
  category?: string;
  logoUrl?: string;
  pickupZone?: string;
  pickupAddress?: string;
  rating?: number;
  approved: boolean;
};

export default function TopVendorsSection() {
  const [vendors, setVendors] = useState<TopVendor[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH APPROVED TOP VENDORS ================= */

  useEffect(() => {
    async function loadTopVendors() {
      try {
        const res = await fetch("/api/top-vendors/accounts", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        // ✅ ONLY approved top vendors
        const approved = Array.isArray(data)
          ? data.filter((v) => v.approved)
          : [];

        setVendors(approved);
      } catch (err) {
        console.error("Top vendors fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTopVendors();
  }, []);

  /* ================= UI ================= */

  return (
    <section className="py-16 bg-gradient-to-b from-cream to-olive-2/20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green/10 rounded-full blur-xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-dark/10 rounded-full blur-xl animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* HEADER */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark">
            Top <span className="text-green">Verified</span> Vendors
          </h2>
          <p className="text-dark/70 mt-3 max-w-2xl mx-auto">
            Premium vendors hand-picked for quality, trust, and outstanding service
          </p>
        </motion.div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center text-dark/60">Loading top vendors…</p>
        ) : vendors.length === 0 ? (
          <p className="text-center text-dark/60">
            No Top Vendors available yet
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor, index) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* ✅ CORRECT CARD */}
                <TopVendorCard
  id={vendor._id}
  name={vendor.businessName}
  image={vendor.logoUrl || "/images/vendor-placeholder.jpg"}
  category={vendor.category || "Top Vendor"}
  rating={vendor.rating ?? 4.9}
  location={vendor.pickupZone || "Location not specified"}
/>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 rounded-full bg-dark text-cream hover:bg-green transition shadow-lg">
            View All Vendors
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* STATS */}
        <div className="bg-cream/80 rounded-2xl p-6 mt-16 shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Stat number={vendors.length} label="Top Vendors" />
            <Stat number="4.9" label="Average Rating" icon />
            <Stat number="98%" label="Satisfaction" />
            <Stat number="24/7" label="Support" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= SMALL ================= */

function Stat({
  number,
  label,
  icon,
}: {
  number: string | number;
  label: string;
  icon?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-center text-2xl font-bold text-green">
        {number}
        {icon && <StarIcon className="w-4 h-4 ml-1 text-yellow-500" />}
      </div>
      <p className="text-sm text-dark/70">{label}</p>
    </div>
  );
}