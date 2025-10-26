'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <ClipboardDocumentListIcon className="w-8 h-8 text-green" />,
      title: 'Browse Vendors',
      description: 'Explore a variety of verified food vendors across campus.',
      color: 'bg-green/20'
    },
    {
      icon: <MapPinIcon className="w-8 h-8 text-mustard" />,
      title: 'Place Your Order',
      description: 'Select meals, confirm details, and send in your order.',
      color: 'bg-mustard/20'
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-dark" />,
      title: 'Get It Delivered',
      description: 'Your food arrives hot and fresh at your location.',
      color: 'bg-dark/20'
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-cream to-olive-2/30 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-1/4 w-64 h-64 bg-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-dark/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-0.5 bg-green mr-3"></div>
            <span className="text-green font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <div className="w-12 h-0.5 bg-green ml-3"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            How It <span className="text-green">Works</span>
          </h2>
          <p className="text-lg text-dark/70 max-w-2xl mx-auto">
            Getting your favorite meals delivered has never been easier. Follow these simple steps to satisfy your cravings.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-16 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-green/30"></div>
          
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-center relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green rounded-full flex items-center justify-center text-cream font-bold text-sm z-10">
                {index + 1}
              </div>
              
              {/* Icon container */}
              <motion.div 
                className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mb-6 relative`}
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-2xl backdrop-blur-sm"></div>
                {step.icon}
              </motion.div>
              
              <h3 className="text-xl font-semibold text-dark mb-3">{step.title}</h3>
              <p className="text-dark/70 leading-relaxed">{step.description}</p>
              
              {/* Connector dot for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden mt-8 w-2 h-2 bg-green/30 rounded-full"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <button className="bg-dark text-cream px-8 py-4 rounded-full font-semibold text-lg hover:bg-green transition-all duration-300 shadow-lg hover:shadow-xl">
            Get Started Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;