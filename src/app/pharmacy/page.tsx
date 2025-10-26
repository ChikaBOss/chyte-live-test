"use client";

import React from 'react';
import { pharmacies } from '../../utils/data';
import PharmacyCard from '../../components/PharmacyCard';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const PharmacyPage = () => {
  return (
    <section className="min-h-screen bg-cream pt-24 pb-16 px-4 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl font-bold mb-4 text-olive-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Approved Pharmacies in FUTO 🏥
          </motion.h2>
          <motion.p
            className="text-lg text-dark max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Browse our trusted pharmacies for reliable medications, supplements, and wellness support on and around campus.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pharmacies.map((pharmacy, index) => (
            <motion.div
              key={pharmacy.id ?? `pharmacy-${index}`}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.5, delay: index * 0.1 }
                }
              }}
              whileHover={{ y: -5 }}
            >
              <PharmacyCard {...pharmacy} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PharmacyPage;