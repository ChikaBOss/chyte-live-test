"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

// UPDATED VENDOR PROFILE INTERFACE
interface VendorProfile {
  _id: string;
  businessName: string;
  ownerName: string;
  email?: string;
  phone?: string;
  
  // Updated pickup location fields
  pickupZone: string;
  pickupAddress?: string;
  pickupPhone: string;
  
  bio?: string;
  logoUrl?: string;
  instagram?: string;
  twitter?: string;
  category?: string;
  approved?: boolean;
  minOrder?: number;
  businessHours?: any[];
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  available?: boolean;
  vendorId?: string;
  category?: string;
  stock?: number;
  tags?: string[];
  unit?: string;
  quantity?: number;
}

const VendorProfilePage = () => {
  const { vendorId } = useParams() as { vendorId?: string };
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products");
  const [quantity, setQuantity] = useState(1);

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendor data
  useEffect(() => {
    if (!vendorId) return;

    async function fetchVendor() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/vendors/${vendorId}/profile`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Vendor not found");

        console.log("Vendor API Response:", data);
        
        setVendor(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching vendor:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [vendorId]);

  // Fetch vendor products
  useEffect(() => {
    if (!vendorId) return;

    async function fetchProducts() {
      try {
        setProductsLoading(true);
        setError(null);

        const res = await fetch(`/api/vendor-products?vendorId=${vendorId}`);
        const payload = await safeJson(res);

        if (!res.ok) {
          console.warn("Vendor products fetch failed:", res.status, payload);
          setProducts([]);
          return;
        }

        const productsData = Array.isArray(payload) ? payload : payload.products || [];

        const filtered = productsData.filter((p: any) => {
          return (
            p.vendorId === vendorId ||
            p.vendorId?.toString?.() === vendorId ||
            p.vendorId?._id === vendorId
          );
        });

        const mapped: Product[] = filtered.map((p: any) => ({
          id: p._id?.toString?.() ?? p._id,
          name: p.name ?? "Untitled Product",
          price: p.price ?? 0,
          image: p.imageUrl || p.image || "/images/product-placeholder.jpg",
          description: p.description || "",
          available: p.available ?? true,
          vendorId: p.vendorId,
          category: p.category,
          stock: p.stock,
          tags: p.tags || [],
          unit: p.unit || "item",
          quantity: p.quantity || 1,
        }));

        console.log(`✅ Loaded ${mapped.length} products for vendor ${vendorId}`);
        setProducts(mapped);
      } catch (err: any) {
        console.error("Error fetching vendor products:", err);
        setProducts([]);
        setError("Failed to load products. Please try again.");
      } finally {
        setProductsLoading(false);
      }
    }

    fetchProducts();
  }, [vendorId]);

  // Safe JSON parsing
  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  // Convert price to number
  const toNumber = (p: any) => {
    if (typeof p === "number") return p;
    if (typeof p === "string") {
      const n = Number(p.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    if (!vendor) return;
  
    addToCart({
      id: product.id,
      name: product.name,
      price: toNumber(product.price) * quantity,
      image: product.image || "/images/product-placeholder.jpg",
      description: product.description || "",
      vendorId: vendorId || "",
      vendorName: vendor.businessName,
      vendorBaseLocation: vendor.pickupZone || 'Eziobodo',
      vendorRole: 'vendor',
      quantity: quantity,
    });
    
    setSelectedProduct(product);
    setShowAddToCartModal(true);
    setTimeout(() => setShowAddToCartModal(false), 2500);
  };
  
  const handleOrderNow = (product: Product) => {
    if (!vendor) return;
  
    addToCart({
      id: product.id,
      name: product.name,
      price: toNumber(product.price) * quantity,
      image: product.image || "/images/product-placeholder.jpg",
      description: product.description || "",
      vendorId: vendorId || "",
      vendorName: vendor.businessName,
      vendorBaseLocation: vendor.pickupZone || 'Eziobodo',
      vendorRole: 'vendor',
      quantity: quantity,
    });
    
    router.push("/checkout");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Loading state
  if (loading || productsLoading) {
    return (
      <section className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mustard border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-dark font-medium">Loading vendor profile...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !vendor) {
    return (
      <section className="min-h-screen bg-cream pt-20 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mt-4">Vendor not found</h2>
          <p className="mt-2 text-dark">No vendor found for ID: {String(vendorId)}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-mustard text-cream px-6 py-2 rounded-lg font-medium hover:bg-olive-2 transition"
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-cream pt-20 pb-12 px-4 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Vendor Header Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 rounded-2xl bg-white shadow-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {vendor.logoUrl ? (
              <img
                src={vendor.logoUrl}
                alt={vendor.businessName || "Vendor"}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-olive-2/10">
                🏪
              </div>
            )}
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-olive-2">
                  {vendor.businessName}
                </h1>
                
                {/* Display pickup zone and address */}
                <div className="flex flex-col items-center md:items-start gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-dark font-medium">
                      Pickup Area: {vendor.pickupZone || "Location not specified"}
                    </p>
                  </div>
                  {vendor.pickupAddress && (
                    <p className="text-sm text-dark/70 ml-7">
                      {vendor.pickupAddress}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-mustard mt-1">
                  {vendor.category || "Food Vendor"}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 bg-cream px-4 py-2 rounded-2xl shadow">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-mustard font-bold ml-1">4.0</span>
                </div>
                <span className="text-sm text-dark">0 reviews</span>
              </div>
            </div>

            <p className="text-dark mt-4 text-lg leading-relaxed">
              {vendor.bio || "Trusted vendor offering quality products and services."}
            </p>

            {/* Vendor details */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark">
              {vendor.minOrder && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Min order: ₦{vendor.minOrder.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Pickup Phone: {vendor.pickupPhone || "Not provided"}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Open for orders
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-mustard/20 mb-8">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "products" ? "text-mustard border-b-2 border-mustard" : "text-dark"
            }`}
            onClick={() => setActiveTab("products")}
          >
            Products ({products.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "reviews" ? "text-mustard border-b-2 border-mustard" : "text-dark"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews (0)
          </button>
        </div>

        {/* Products Tab Content */}
        {activeTab === "products" && (
          <motion.div
            className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl">
                <svg className="w-16 h-16 text-mustard mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-dark text-lg">No products available yet.</p>
                <p className="text-dark/70 mt-1">Check back soon for new offerings!</p>
              </div>
            ) : (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  variants={itemVariants}
                >
                  {/* MOBILE VERTICAL LIST STYLE - ENLARGED */}
                  <div className="md:hidden">
                    <div className="p-5 flex items-start gap-4">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <Image
                          src={product.image || "/images/product-placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-olive-2 text-lg line-clamp-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-dark/70 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-bold text-dark text-lg">
                            ₦{toNumber(product.price).toLocaleString()}
                          </p>
                          
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setQuantity(1);
                              setShowDetailModal(true);
                            }}
                            disabled={!product.available}
                            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors shadow-sm ${
                              product.available
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {product.available ? "Add" : "Sold Out"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP GRID STYLE */}
                  <div className="hidden md:block">
                    <div
                      className="relative h-48 cursor-pointer overflow-hidden"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDetailModal(true);
                      }}
                    >
                      <Image
                        src={product.image || "/images/product-placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute top-4 right-4 bg-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                        ₦{toNumber(product.price).toLocaleString()}
                        {product.unit && <span className="text-xs ml-1">/{product.unit}</span>}
                      </div>
                      {!product.available && (
                        <div className="absolute top-4 left-4 bg-red-600 text-cream px-3 py-1 rounded-full text-xs font-bold">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-xl text-olive-2 mb-2">{product.name}</h3>
                      <p className="text-sm text-dark mb-4 line-clamp-2">
                        {product.description || "Quality product from trusted vendor."}
                      </p>

                      {product.tags && product.tags.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs bg-cream text-dark px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="text-xs text-dark">
                                +{product.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-2 bg-cream text-dark rounded-full font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Details
                        </button>
                        <button
                          onClick={() => handleOrderNow(product)}
                          disabled={!product.available}
                          className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 flex items-center gap-2 ${
                            product.available
                              ? "bg-mustard text-cream hover:bg-olive-2"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Order Now
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === "reviews" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-olive-2">Customer Reviews</h3>
                <button
                  className="px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 bg-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                  title="Place an order first to review this vendor"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Write a Review
                </button>
              </div>

              <div className="text-center py-8 text-dark">
                <svg className="w-16 h-16 text-mustard mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No reviews yet. Be the first to review after ordering!</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Added to Cart Modal */}
      <AnimatePresence>
        {showAddToCartModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-olive-2">Added to Cart!</h3>
              <p className="mt-2 text-dark">
                {quantity} {selectedProduct.unit} of {selectedProduct.name} has been added to your cart.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddToCartModal(false)}
                  className="flex-1 bg-cream text-dark border border-mustard py-2 rounded-lg font-medium hover:bg-mustard hover:text-cream transition"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push("/checkout")}
                  className="flex-1 bg-mustard text-cream py-2 rounded-lg font-medium hover:bg-olive-2 transition"
                >
                  Checkout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="bg-cream rounded-2xl overflow-hidden w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56">
                <Image
                  src={selectedProduct.image || "/images/product-placeholder.jpg"}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <button
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream text-dark flex items-center justify-center hover:bg-mustard hover:text-cream transition-colors"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-olive-2 mb-2">
                  {selectedProduct.name}
                </h3>
                <p className="text-dark mb-4">
                  {selectedProduct.description || "Quality product from trusted vendor."}
                </p>

                {/* Tags Section */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-dark mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, idx) => (
                        <span key={idx} className="text-sm bg-white text-dark px-3 py-1 rounded-full border border-mustard/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-2 mb-4">
                  {selectedProduct.category && (
                    <div className="flex items-center gap-2 text-dark">
                      <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>Category: {selectedProduct.category}</span>
                    </div>
                  )}
                  {selectedProduct.stock !== undefined && (
                    <div className="flex items-center gap-2 text-dark">
                      <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>
                        Stock:{" "}
                        {selectedProduct.stock > 0
                          ? `${selectedProduct.stock} available`
                          : "Out of stock"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-dark">
                    <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span>Unit: {selectedProduct.unit || "item"}</span>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="mb-6">
                  <label className="block text-dark font-medium mb-2">
                    Select Quantity:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-mustard/30 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-dark hover:bg-mustard/10"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-dark font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-dark hover:bg-mustard/10"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xl font-bold text-mustard">
                      ₦{(toNumber(selectedProduct.price) * quantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setShowDetailModal(false);
                    }}
                    disabled={!selectedProduct.available}
                    className={`py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2 ${
                      selectedProduct.available
                        ? "bg-white text-dark hover:bg-mustard hover:text-cream border border-mustard/30"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {selectedProduct.available ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button
                    onClick={() => {
                      handleOrderNow(selectedProduct);
                      setShowDetailModal(false);
                    }}
                    disabled={!selectedProduct.available}
                    className={`py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2 ${
                      selectedProduct.available
                        ? "bg-mustard text-cream hover:bg-olive-2"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Order Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VendorProfilePage;