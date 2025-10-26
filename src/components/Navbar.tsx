"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-cream/95 backdrop-blur-md shadow-xl py-2 border-b border-dark/10" 
            : "bg-cream/80 backdrop-blur-sm py-4"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                <Image 
                  src="/logo.png" 
                  alt="Chyte Logo" 
                  width={45} 
                  height={45} 
                  className="relative z-10 drop-shadow-md"
                />
              </div>
              <span className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-dark to-green">
                Chyte
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/vendors", label: "Vendors" },
              { href: "/chefs", label: "Chefs" },
              { href: "/pharmacy", label: "Pharmacies" },
              { href: "/dashboard", label: "Dashboard" },
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative px-4 py-2 font-medium text-dark hover:text-green transition-colors duration-300 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Section - Auth + Cart */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-olive-2/10 transition-colors duration-300">
                <ShoppingCartIcon className="w-6 h-6 text-dark" />
                {cart.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full border border-green text-green hover:bg-green hover:text-cream transition-all duration-300 font-medium text-sm shadow-sm"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green to-dark text-cream hover:shadow-lg transition-all duration-300 font-medium text-sm"
                >
                  Register
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button 
              className="md:hidden p-2 rounded-full hover:bg-olive-2/10 transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-dark" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-dark" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* --- Spacer to prevent content being covered by fixed nav --- */}
      <div className="h-24 md:h-28" aria-hidden />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-cream shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-dark/10">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                      <Image src="/logo.png" alt="Chyte Logo" width={40} height={40} />
                      <span className="text-lg font-bold">Chyte</span>
                    </Link>
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-full hover:bg-olive-2/10"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {[
                      { href: "/", label: "Home" },
                      { href: "/vendors", label: "Vendors" },
                      { href: "/chefs", label: "Chefs" },
                      { href: "/pharmacy", label: "Pharmacies" },
                      { href: "/dashboard", label: "Dashboard" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="block py-3 text-lg font-medium text-dark hover:text-green transition-colors duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-12 pt-6 border-t border-dark/10">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Link
                          href="/login"
                          className="block w-full text-center py-3 rounded-full border border-green text-green hover:bg-green hover:text-cream transition-all duration-300 font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Link
                          href="/register"
                          className="block w-full text-center py-3 rounded-full bg-gradient-to-r from-green to-dark text-cream hover:shadow-lg transition-all duration-300 font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-dark/10">
                  <p className="text-center text-sm text-dark/60">
                    © {new Date().getFullYear()} Chyte. All rights reserved.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;




