"use client";

import React from "react";
import { motion } from "framer-motion";
import VendorCard from "./VendorCard";
import { topVendors } from "../utils/data";
import { StarIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const TopVendorsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-cream to-olive-2/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-dark/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-0.5 bg-green mr-3"></div>
            <span className="text-green font-semibold text-sm uppercase tracking-wider">Premium Selection</span>
            <div className="w-12 h-0.5 bg-green ml-3"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Top <span className="text-green">Verified</span> Vendors
          </h2>
          <p className="text-lg text-dark/70 max-w-2xl mx-auto">
            Discover the most exceptional culinary talents on campus, carefully selected for their quality and service
          </p>
        </motion.div>

        {/* Vendor Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {topVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <VendorCard
                id={vendor.id}
                name={vendor.name}
                image={vendor.image}
                category={vendor.category}
                specialty={vendor.specialty}
                rating={vendor.rating}
                location={vendor.location}
              />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <button className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-dark text-cream font-semibold text-lg hover:bg-green transition-all duration-300 shadow-lg hover:shadow-xl">
            View All Vendors
            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="bg-cream/80 backdrop-blur-md rounded-2xl p-6 mt-16 shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "50+", label: "Total Vendors" },
              { number: "4.9", label: "Average Rating", icon: <StarIcon className="w-4 h-4 text-yellow-500 fill-current" /> },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center text-2xl font-bold text-green mb-2">
                  {stat.number}
                  {stat.icon && <span className="ml-1">{stat.icon}</span>}
                </div>
                <div className="text-dark/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Animation styles */}
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
      `}</style>
    </section>
  );
};

export default TopVendorsSection;