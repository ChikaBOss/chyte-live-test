'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, PhoneIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';

interface PharmacyCardProps {
  id: string;
  name: string;
  image?: string;
  specialty?: string;
  location: string;
  pickupAddress?: string;
  pickupPhone?: string;
  rating?: number;
  minOrder?: number;
  available?: boolean;
}

const PharmacyCard = ({
  id,
  name,
  image,
  specialty = 'Pharmacy & Healthcare',
  location,
  pickupAddress,
  pickupPhone,
  rating = 0,
  minOrder,
  available = true,
}: PharmacyCardProps) => {
  const hasImage = typeof image === 'string' && image.trim().length > 0;

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      {/* IMAGE SECTION */}
      <div className="relative w-full h-48 overflow-hidden">
        {hasImage ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-olive-2/10 text-6xl">
            🏥
          </div>
        )}

        {/* RATING BADGE */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-dark">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* AVAILABILITY BADGE */}
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
            available 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {available ? 'Available' : 'Closed'}
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-olive-2 mb-1 group-hover:text-green-600 transition-colors">
          {name}
        </h3>

        <p className="text-green-600 font-medium text-sm mb-3">
          {specialty}
        </p>

        {/* LOCATION WITH PICKUP DETAILS */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-dark/80 text-sm">
            <MapPinIcon className="w-4 h-4 text-mustard mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">{location}</span>
              {pickupAddress && (
                <p className="text-xs text-dark/60 mt-0.5">{pickupAddress}</p>
              )}
            </div>
          </div>

          {pickupPhone && (
            <div className="flex items-center gap-2 text-dark/80 text-sm">
              <PhoneIcon className="w-4 h-4 text-mustard" />
              <span>{pickupPhone}</span>
            </div>
          )}
        </div>

        {/* TAGS & DETAILS */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {specialty && (
            <span className="px-3 py-1 bg-cream text-dark text-xs rounded-full border border-mustard/20">
              {specialty}
            </span>
          )}
          {typeof minOrder === 'number' && minOrder > 0 && (
            <span className="px-3 py-1 bg-mustard/10 text-dark text-xs rounded-full flex items-center gap-1">
              <ShoppingBagIcon className="w-3 h-3" />
              Min: ₦{minOrder.toLocaleString()}
            </span>
          )}
        </div>

        {/* VIEW PROFILE BUTTON */}
        <Link href={`/pharmacies/${id}`}>
          <motion.button
            className="w-full bg-mustard text-white py-3 rounded-xl font-semibold hover:bg-olive-2 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Pharmacy
            <span className="ml-1">→</span>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default PharmacyCard;