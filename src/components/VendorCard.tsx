'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

type VendorProps = {
  id: string;
  name: string;
  image: string;
  category?: string;
  specialty?: string;
  rating: number;
  location?: string;
};

export default function VendorCard({
  id,
  name,
  image,
  category,
  specialty,
  rating,
  location,
}: VendorProps) {
  const displayText = category || specialty || 'Vendor';
  
  return (
    <motion.div 
      className="bg-cream rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      {/* Image container with overlay */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-dark">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-green transition-colors duration-300">
          {name}
        </h3>
        
        <p className="text-green font-medium text-sm mb-3">{displayText}</p>
        
        {/* Location details (if available) */}
        {location && (
          <div className="flex items-center gap-2 text-dark/70 text-sm mb-4">
            <MapPinIcon className="w-4 h-4 text-green" />
            <span>{location}</span>
          </div>
        )}
        
        {/* Tags from specialty or category */}
        <div className="flex flex-wrap gap-2 mb-5">
          {displayText.split(",").slice(0, 3).map((item, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-olive-2/20 text-dark text-xs rounded-full"
            >
              {item.trim()}
            </span>
          ))}
        </div>

        {/* View Profile Button */}
        <Link href={`/vendors/${id}`}>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}