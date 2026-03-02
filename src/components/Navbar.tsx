"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { cart } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const [mobileRegisterOpen, setMobileRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((p) => !p);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".login-dropdown")) {
        setShowLoginDropdown(false);
      }
      if (!e.target.closest(".register-dropdown")) {
        setShowRegisterDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Mobile accordion handlers – close the other when one opens
  const handleMobileLoginToggle = () => {
    setMobileLoginOpen(!mobileLoginOpen);
    setMobileRegisterOpen(false);
  };
  const handleMobileRegisterToggle = () => {
    setMobileRegisterOpen(!mobileRegisterOpen);
    setMobileLoginOpen(false);
  };

  return (
    <>
      {/* NAVBAR */}
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
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                <Image
                  src="/images/logo.jpg"
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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/vendors", label: "Vendors" },
              { href: "/chefs", label: "Chefs" },
              { href: "/pharmacy", label: "Pharmacies" },
              { href: "/dashboard", label: "Dashboard" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 font-medium text-dark hover:text-green transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-olive-2/10 transition-colors"
              >
                <ShoppingCartIcon className="w-6 h-6 text-dark" />

                {mounted && cart.length > 0 && (
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

            {/* Desktop Auth with Two Dropdowns */}
            <div className="hidden md:flex items-center gap-3">
              {/* Login Dropdown */}
              <div className="relative login-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLoginDropdown(!showLoginDropdown);
                    setShowRegisterDropdown(false); // close the other
                  }}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-green text-green hover:bg-green hover:text-cream transition-all font-medium text-sm"
                >
                  Login
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      showLoginDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showLoginDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50"
                    >
                      <Link
                        href="/vendors/login"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowLoginDropdown(false)}
                      >
                        Login as Vendor
                      </Link>
                      <Link
                        href="/chefs/login"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowLoginDropdown(false)}
                      >
                        Login as Chef
                      </Link>
                      <Link
                        href="/pharmacy/login"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowLoginDropdown(false)}
                      >
                        Login as Pharmacy
                      </Link>
                      <Link
                        href="/topVendor/login"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowLoginDropdown(false)}
                      >
                        Login as Top Vendor
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Register Dropdown */}
              <div className="relative register-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRegisterDropdown(!showRegisterDropdown);
                    setShowLoginDropdown(false); // close the other
                  }}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-green to-dark text-cream hover:shadow-lg transition-all font-medium text-sm"
                >
                  Register
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      showRegisterDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showRegisterDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50"
                    >
                      <Link
                        href="/vendors/register"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowRegisterDropdown(false)}
                      >
                        Register as Vendor
                      </Link>
                      <Link
                        href="/chefs/register"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowRegisterDropdown(false)}
                      >
                        Register as Chef
                      </Link>
                      <Link
                        href="/pharmacy/register"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowRegisterDropdown(false)}
                      >
                        Register as Pharmacy
                      </Link>
                      <Link
                        href="/topVendor/register"
                        className="block px-4 py-2 text-sm text-dark hover:bg-cream/50"
                        onClick={() => setShowRegisterDropdown(false)}
                      >
                        Register as Top Vendor
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full hover:bg-olive-2/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-dark" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-dark" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Spacer */}
      <div className="h-14 md:h-16" aria-hidden />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 h-full w-80 bg-cream shadow-2xl z-50 md:hidden"
            >
              {/* Close button inside sidebar */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-olive-2/10 md:hidden"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6 text-dark" />
              </button>

              <div className="p-6 pt-16 space-y-6">
                {/* Navigation Links */}
                {[
                  { href: "/", label: "Home" },
                  { href: "/vendors", label: "Vendors" },
                  { href: "/chefs", label: "Chefs" },
                  { href: "/pharmacy", label: "Pharmacies" },
                  { href: "/dashboard", label: "Dashboard" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg font-medium text-dark hover:text-green"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Divider */}
                <div className="border-t border-dark/10" />

                {/* Mobile Login Accordion */}
                <div>
                  <button
                    onClick={handleMobileLoginToggle}
                    className="flex items-center justify-between w-full text-left text-lg font-medium text-dark hover:text-green"
                  >
                    <span>Login</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${
                        mobileLoginOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileLoginOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 mt-2 space-y-2">
                          <Link
                            href="/vendors/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Vendor
                          </Link>
                          <Link
                            href="/chefs/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Chef
                          </Link>
                          <Link
                            href="/pharmacy/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Pharmacy
                          </Link>
                          <Link
                            href="/topVendor/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Top Vendor
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Register Accordion */}
                <div>
                  <button
                    onClick={handleMobileRegisterToggle}
                    className="flex items-center justify-between w-full text-left text-lg font-medium text-dark hover:text-green"
                  >
                    <span>Register</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${
                        mobileRegisterOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileRegisterOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 mt-2 space-y-2">
                          <Link
                            href="/vendors/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Vendor
                          </Link>
                          <Link
                            href="/chefs/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Chef
                          </Link>
                          <Link
                            href="/pharmacy/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Pharmacy
                          </Link>
                          <Link
                            href="/topVendor/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base text-dark/80 hover:text-green"
                          >
                            Top Vendor
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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