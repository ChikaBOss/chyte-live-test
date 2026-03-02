'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

// Category icons with emojis
const CATEGORIES = [
  { name: 'Food', icon: '🍔', slug: 'food' },
  { name: 'Grocery', icon: '🛒', slug: 'grocery' },
  { name: 'Medicine', icon: '💊', slug: 'medicine' },
  { name: 'Dessert', icon: '🍰', slug: 'dessert' },
  { name: 'Ice Cream', icon: '🍦', slug: 'ice-cream' },
  { name: 'Pizza', icon: '🍕', slug: 'pizza' },
  { name: 'Coffee', icon: '☕', slug: 'coffee' },
  { name: 'Sanitary', icon: '🧻', slug: 'sanitary' },
  { name: 'Native Food', icon: '🍲', slug: 'native-food' },
  { name: 'Futo Street Food', icon: '🌮', slug: 'street-food' },
];

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    router.push(`/category/${slug}`);
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden px-4 pb-20 pt-0">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/images/hero-bg3.PNG')" }}
      />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-green/40 to-cream/60 z-1"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-olive/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-mustard/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-green/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto w-full mt-8 md:mt-12">
        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-cream/80 backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-2xl border border-white/20"
        >
          <motion.h1 
            className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-dark to-green">
              Savor Campus Delights
            </span>{' '}
            🍽️
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-2xl mb-6 md:mb-10 text-dark/80 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover exceptional meals from curated vendors and talented chefs around FUTO. 
            Experience the taste of campus cuisine like never before.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto w-full mb-8"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for food, groceries, medicines..."
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white/30 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green text-dark"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-green to-dark text-cream px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </motion.div>

          {/* Category Icons - Horizontal Scroll on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="w-full mb-8"
          >
            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide md:flex-wrap md:justify-center md:overflow-visible">
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category.slug}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[80px] ${
                    selectedCategory === category.slug
                      ? 'bg-green text-cream'
                      : 'bg-white/80 hover:bg-green/20 text-dark'
                  }`}
                >
                  <span className="text-3xl">{category.icon}</span>
                  <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 pt-6 border-t border-dark/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { number: '50+', label: 'Vendors' },
              { number: '1000+', label: 'Meals Served' },
              { number: '4.9', label: 'Avg Rating' },
              { number: '24/7', label: 'Available' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green">{stat.number}</div>
                <div className="text-xs md:text-sm text-dark/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="w-6 h-10 border-2 border-dark/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-green rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;