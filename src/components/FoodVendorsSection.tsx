'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SparklesIcon, TruckIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const FoodVendorsSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-cream to-olive-2/20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-dark/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* TEXT LEFT */}
        <motion.div 
          className="text-dark"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center lg:justify-start mb-4">
            <div className="w-8 h-0.5 bg-green mr-3"></div>
            <span className="text-green font-semibold text-sm uppercase tracking-wider">Culinary Diversity</span>
            <div className="w-8 h-0.5 bg-green ml-3"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Explore Our <span className="text-green">Food Vendors</span>
          </h2>
          
          <p className="text-lg mb-8 leading-relaxed text-dark/80">
            Discover a wide variety of local and premium food vendors offering diverse and delicious meals. 
            From everyday favorites to premium exclusives — explore what suits your cravings best.
          </p>
          
          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: <TruckIcon className="w-5 h-5 text-green" />, text: "Quick Delivery" },
              { icon: <SparklesIcon className="w-5 h-5 text-green" />, text: "Premium Selection" },
              { icon: <StarIcon className="w-5 h-5 text-green" />, text: "Rated Vendors" },
              { icon: "🍔", text: "Diverse Cuisines" },
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
              href="/vendors"
              className="group inline-flex items-center justify-center bg-dark text-cream px-8 py-4 rounded-full font-semibold text-lg hover:bg-green transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Vendors
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* IMAGE RIGHT */}
        <motion.div 
          className="w-full h-96 lg:h-[500px] relative rounded-2xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-green to-dark rounded-2xl opacity-20 blur-lg z-0"></div>
          <Image
            src="/images/food-vendor.jpg"
            alt="Food Vendor Showcase"
            fill
            className="object-cover rounded-2xl z-10"
          />
          
          {/* Floating badges */}
          <motion.div 
            className="absolute top-6 left-6 bg-cream/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 z-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="w-4 h-4 text-yellow-500" />
              ))}
            </div>
            <span className="font-bold text-dark">4.8/5 Rating</span>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-6 right-6 bg-dark text-cream px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-20"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <TruckIcon className="w-5 h-5" />
            <span className="font-semibold">Fast Delivery</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoodVendorsSection;