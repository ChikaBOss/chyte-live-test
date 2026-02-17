'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartIcon, ShieldCheckIcon, TruckIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const PharmacySection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-bl from-cream to-green/10 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-dark/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
        {/* Right Image */}
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green to-dark rounded-2xl opacity-20 blur-lg"></div>
            <Image
              src="/images/pharmacy-illustration.png"
              alt="Pharmacy Services"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl object-cover w-full h-auto"
              priority
            />
            
            {/* Floating badges */}
            <motion.div 
              className="absolute -top-4 -left-4 bg-dark text-cream px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-semibold">Verified Pharmacies</span>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-6 right-6 bg-cream/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <TruckIcon className="w-5 h-5 text-green" />
              <span className="font-bold text-dark">Fast Delivery</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Left Text */}
        <motion.div 
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center md:justify-start mb-4">
            <div className="w-8 h-0.5 bg-green mr-3"></div>
            <span className="text-green font-semibold text-sm uppercase tracking-wider">Health & Wellness</span>
            <div className="w-8 h-0.5 bg-green ml-3"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Need <span className="text-green">Medications</span> or Health Support?
          </h2>
          
          <p className="text-lg text-dark/80 mb-8 leading-relaxed">
            Explore our verified campus pharmacies for prescription drugs, supplements, and wellness care. 
            Get access to quality healthcare products right where you need them.
          </p>
          
          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: <HeartIcon className="w-5 h-5 text-green" />, text: "Prescription Drugs" },
              { icon: "💊", text: "Supplements" },
              { icon: "🌿", text: "Wellness Products" },
              { icon: <TruckIcon className="w-5 h-5 text-green" />, text: "Fast Delivery" },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3 p-3 bg-cream/80 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                {feature.icon}
                <span className="text-dark font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <Link
              href="/pharmacies"
              className="group inline-flex items-center justify-center bg-dark text-cream px-8 py-4 rounded-full font-semibold text-lg hover:bg-green transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Pharmacies
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PharmacySection;