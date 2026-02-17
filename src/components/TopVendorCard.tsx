'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

type TopVendorProps = {
  id: string;
  name: string;
  image: string;
  category?: string;
  rating: number;

  // 👇 SUPPORT BOTH
  location?: string;     // already human readable
  pickupZone?: string;   // enum from DB
};

const zoneLabelMap: Record<string, string> = {
  EZIOBODO: 'Eziobodo',
  EZIOBODO_MARKET: 'Eziobodo Market',
  INSIDE_SCHOOL: 'Inside School',
  UMUCHIMA: 'Umuchima',
  BACK_GATE: 'Back Gate',
  IHIAGWA: 'Ihiagwa',
  IHIAGWA_MARKET: 'Ihiagwa Market',
  FUTO_GATE_ROAD: 'Along FUTO Gate Road',
  FUTO_JUNCTION: 'After FUTO Junction',
  REDEMPTION_ESTATE: 'Redemption Estate',
  AVU_JUNCTION: 'Avu Junction',
  HOSPITAL_JUNCTION: 'Hospital Junction',
  NEW_OWERRI: 'New Owerri / World Bank',
  POLY_JUNCTION: 'Poly Junction',
};

export default function TopVendorCard({
  id,
  name,
  image,
  category,
  rating,
  location,
  pickupZone,
}: TopVendorProps) {
  const displayText = category || 'Top Vendor';

  // ✅ FINAL LOCATION RESOLUTION
  const resolvedLocation =
    location ||
    (pickupZone ? zoneLabelMap[pickupZone] || pickupZone : undefined);

  return (
    <motion.div
      className="bg-cream rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      {/* IMAGE */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* RATING */}
        <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-dark">{rating}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-green transition-colors duration-300">
          {name}
        </h3>

        <p className="text-green font-medium text-sm mb-3">
          {displayText}
        </p>

        {/* 📍 LOCATION */}
        {resolvedLocation && (
          <div className="flex items-center gap-2 text-dark/70 text-sm mb-4">
            <MapPinIcon className="w-4 h-4 text-green" />
            <span>{resolvedLocation}</span>
          </div>
        )}

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mb-5">
          {displayText
            .split(',')
            .slice(0, 3)
            .map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-olive-2/20 text-dark text-xs rounded-full"
              >
                {item.trim()}
              </span>
            ))}
        </div>

        {/* LINK */}
        <Link href={`/topVendor/${id}`}>
          <motion.button
            className="w-full bg-dark text-cream py-3 rounded-xl font-semibold hover:bg-green transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Profile
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}