"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserGroupIcon, StarIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const ChefsSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-cream to-olive-2/30 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-dark/10 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 relative z-10">
        {/* Image or illustration */}
        <motion.div 
          className="w-full lg:w-1/2 relative"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green to-dark rounded-2xl opacity-20 blur-lg"></div>
            <Image
              src="/images/chef-illustration.jpg"
              alt="Professional Chefs"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl object-cover w-full h-auto"
            />
            {/* Floating badge */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-dark text-cream px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <UserGroupIcon className="w-5 h-5" />
              <span className="font-semibold">50+ Professional Chefs</span>
            </motion.div>
            
            {/* Rating badge */}
            <motion.div 
              className="absolute bottom-6 left-6 bg-cream/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2"
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
              <span className="font-bold text-dark">4.9/5 Rating</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Text and CTA */}
        <motion.div 
          className="w-full lg:w-1/2 text-center lg:text-left"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center lg:justify-start mb-4">
            <div className="w-8 h-0.5 bg-green mr-3"></div>
            <span className="text-green font-semibold text-sm uppercase tracking-wider">Culinary Excellence</span>
            <div className="w-8 h-0.5 bg-green ml-3"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-6 leading-tight">
            Meet Our <span className="text-green">Skilled</span> Chefs
          </h2>
          
          <p className="text-lg text-dark/80 mb-8 leading-relaxed">
            Discover a curated selection of talented chefs offering exquisite home-cooked meals 
            and professional event catering services. Our verified chefs bring passion, creativity, 
            and expertise directly to your table.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Home-Cooked Meals", icon: "🍽️" },
              { label: "Event Catering", icon: "🎉" },
              { label: "Custom Menus", icon: "📋" },
              { label: "Dietary Options", icon: "🌱" },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2 p-3 bg-cream/80 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-dark font-medium text-sm">{feature.label}</span>
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
              href="/chefs"
              className="group inline-flex items-center justify-center bg-dark text-cream px-8 py-4 rounded-full font-semibold text-lg hover:bg-green transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore All Chefs
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChefsSection;