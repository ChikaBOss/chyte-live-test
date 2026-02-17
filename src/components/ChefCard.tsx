import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/solid";

type ChefProps = {
  id: string;
  name: string;
  image: string;
  specialty: string;
  experience: string;
  rating: number;
  location: string;
  minOrder?: number;
  available?: boolean;
};

export default function ChefCard({
  id,
  name,
  image,
  specialty,
  experience,
  rating,
  location,
  minOrder = 0,
  available = true,
}: ChefProps) {
  // Function to get a placeholder image if none exists
  const getImageSrc = (img: string, chefName: string) => {
    if (img && img !== '' && !img.includes('undefined')) return img;
    
    // Return a placeholder based on chef name
    const colors = ['bg-mustard', 'bg-green', 'bg-olive-2', 'bg-dark'];
    const colorIndex = chefName.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  const imageSrc = getImageSrc(image, name);
  const isPlaceholder = typeof imageSrc === 'string' && imageSrc.startsWith('bg-');

  return (
    <motion.div 
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      {/* Image container with overlay */}
      <div className="relative w-full h-48 overflow-hidden">
        {isPlaceholder ? (
          <div 
            className={`w-full h-full flex items-center justify-center text-cream text-4xl font-bold ${imageSrc}`}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Image 
            src={imageSrc} 
            alt={name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-dark">{rating.toFixed(1)}</span>
        </div>
        
        {/* Experience badge */}
        <div className="absolute top-3 left-3 bg-green/90 text-cream px-3 py-1 rounded-full text-xs font-medium shadow-md">
          {experience}
        </div>

        {/* Availability indicator */}
        {!available && (
          <div className="absolute top-12 left-3 bg-red-500 text-cream px-2 py-1 rounded-full text-xs font-medium shadow-md">
            Unavailable
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-green transition-colors duration-300">
          {name}
        </h3>
        
        <p className="text-green font-medium text-sm mb-3 line-clamp-2">{specialty}</p>
        
        {/* Location and other details */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-dark/70 text-sm">
            <MapPinIcon className="w-4 h-4 text-green" />
            <span className="truncate">{location}</span>
          </div>
          
          {minOrder > 0 && (
            <div className="flex items-center gap-2 text-dark/70 text-sm">
              <ClockIcon className="w-4 h-4 text-green" />
              <span>Min. Order: ₦{minOrder.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {/* Skills tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {specialty.split(",").slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-olive-2/20 text-dark text-xs rounded-full"
            >
              {skill.trim()}
            </span>
          ))}
          {specialty.split(",").length > 3 && (
            <span className="px-2 py-1 bg-dark/10 text-dark text-xs rounded-full">
              +{specialty.split(",").length - 3} more
            </span>
          )}
        </div>

        {/* View Profile Button */}
        <Link href={`/chefs/${id}`}>
          <motion.button 
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-md ${
              available 
                ? 'bg-dark text-cream hover:bg-green' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={available ? { scale: 1.02 } : {}}
            whileTap={available ? { scale: 0.98 } : {}}
            disabled={!available}
          >
            {available ? 'View Profile' : 'Currently Unavailable'}
            {available && (
              <svg 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}