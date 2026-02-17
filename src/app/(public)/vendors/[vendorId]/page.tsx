"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

// UPDATED VENDOR PROFILE INTERFACE
interface VendorProfile {
  _id: string;
  businessName: string;          // Changed from optional to required
  ownerName: string;             // Changed from optional to required
  email?: string;
  phone?: string;
  
  // Updated pickup location fields (matching TopVendor structure)
  pickupZone: string;            // Added: Required pickup zone
  pickupAddress?: string;        // Added: Optional detailed address
  pickupPhone: string;           // Added: Required pickup phone
  
  bio?: string;
  logoUrl?: string;
  instagram?: string;
  twitter?: string;
  category?: string;
  approved?: boolean;
  minOrder?: number;
  businessHours?: any[];
}

// REMOVED: name?: string; (use businessName instead)
// REMOVED: address?: string; (use pickupZone and pickupAddress instead)

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

interface Rating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  orderId?: string;
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
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
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

        // Use the correct vendor API endpoint
        const res = await fetch(`/api/vendors/${vendorId}/profile`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Vendor not found");

        // IMPORTANT: Verify API returns pickup fields
        console.log("Vendor API Response:", data);
        
        // Ensure vendor has required fields
        if (!data.businessName) {
          console.warn("Vendor data missing businessName:", data);
        }
        if (!data.pickupZone) {
          console.warn("Vendor data missing pickupZone:", data);
        }
        if (!data.pickupPhone) {
          console.warn("Vendor data missing pickupPhone:", data);
        }

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

  // Fetch vendor products - UPDATED TO MATCH CHEF PAGE LOGIC
  useEffect(() => {
    if (!vendorId) return;

    async function fetchProducts() {
      try {
        setProductsLoading(true);
        setError(null);

        // IMPORTANT: Use the correct endpoint for vendor products
        // This should match your backend API route
        const res = await fetch(`/api/vendor-products/vendor/${vendorId}`);
        
        // Use safeJson to handle parsing errors
        const payload = await safeJson(res);

        if (!res.ok) {
          console.warn("Vendor products fetch failed:", res.status, payload);
          setProducts([]);
          return;
        }

        // Handle both array and object responses
        const productsData = Array.isArray(payload) ? payload : payload.products || [];

        // Filter products by vendorId to ensure data integrity
        const filtered = productsData.filter((p: any) => {
          return (
            p.vendorId === vendorId ||
            p.vendorId?.toString?.() === vendorId ||
            p.vendorId?._id === vendorId ||
            // Also check for chefId if using same data structure
            p.chefId === vendorId ||
            p.chefId?.toString?.() === vendorId
          );
        });

        // Map to Product interface
        const mapped: Product[] = filtered.map((p: any) => ({
          id: p._id?.toString?.() ?? p._id,
          name: p.name ?? "Untitled Product",
          price: p.price ?? 0,
          image: p.imageUrl || p.image || "/images/product-placeholder.jpg",
          description: p.description || "",
          available: p.available ?? true,
          vendorId: p.vendorId || p.chefId,
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
      console.warn("Failed to parse JSON response");
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

  // Add to cart handler - UPDATED to use businessName
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
      vendorRole: 'vendor', // 🔥 ADDED: Vendor role
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
      vendorRole: 'vendor', // 🔥 ADDED: Vendor role
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
                {/* CHANGED: Use businessName directly */}
                <h1 className="text-3xl md:text-4xl font-bold text-olive-2">
                  {vendor.businessName}
                </h1>
                
                {/* UPDATED: Display pickup zone and address (like TopVendor) */}
                <div className="flex flex-col items-center md:items-start gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-location-dot text-mustard"></i>
                    <p className="text-dark font-medium">
                      Pickup Area: {vendor.pickupZone || "Location not specified"}
                    </p>
                  </div>
                  {vendor.pickupAddress && (
                    <p className="text-sm text-dark/70 ml-6">
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
                    <i
                      key={i}
                      className={`fas fa-star ${i < 4 ? "text-yellow-400" : "text-gray-300"}`}
                    ></i>
                  ))}
                  <span className="text-mustard font-bold ml-1">4.0</span>
                </div>
                <span className="text-sm text-dark">0 reviews</span>
              </div>
            </div>

            <p className="text-dark mt-4 text-lg leading-relaxed">
              {vendor.bio || "Trusted vendor offering quality products and services."}
            </p>

            {/* Vendor details - ADDED pickup phone display */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark">
              {vendor.minOrder && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-shopping-bag text-mustard"></i>
                  Min order: ₦{vendor.minOrder.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <i className="fas fa-phone text-mustard"></i>
                Pickup Phone: {vendor.pickupPhone || "Not provided"}
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-store text-mustard"></i>
                Open for orders
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs for Products and Reviews */}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fas fa-box-open text-4xl text-mustard mb-3"></i>
                <p className="text-dark text-lg">No products available yet.</p>
                <p className="text-dark/70 mt-1">Check back soon for new offerings!</p>
              </div>
            ) : (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
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
                      className="object-cover"
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
                    <p className="text-sm text-dark mb-4">
                      {product.description || "Quality product from trusted vendor."}
                    </p>

                    {product.tags && product.tags.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-cream text-dark px-2 py-1 rounded"
                            >
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
                        <i className="fas fa-info-circle"></i>
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
                        <i className="fas fa-arrow-right"></i>
                      </button>
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
                  <i className="fas fa-plus"></i> Write a Review
                </button>
              </div>

              <div className="text-center py-8 text-dark">
                <i className="fas fa-comment-slash text-4xl text-mustard mb-3"></i>
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
              <h3 className="text-xl font-bold text-olive-2 mt-4">Added to Cart!</h3>
              <p className="mt-2 text-dark">
                {quantity} {selectedProduct.unit} of {selectedProduct.name} has been added to
                your cart.
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
                />
                <button
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream text-dark flex items-center justify-center"
                  onClick={() => setShowDetailModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-olive-2 mb-2">
                  {selectedProduct.name}
                </h3>
                <p className="text-dark mb-4">
                  {selectedProduct.description ||
                    "Quality product from trusted vendor."}
                </p>

                {/* Tags Section */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-dark mb-2">
                      <i className="fas fa-tags text-mustard mr-2"></i>
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-white text-dark px-3 py-1 rounded-full border border-mustard/20"
                        >
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
                      <i className="fas fa-layer-group text-mustard"></i>
                      <span>Category: {selectedProduct.category}</span>
                    </div>
                  )}
                  {selectedProduct.stock !== undefined && (
                    <div className="flex items-center gap-2 text-dark">
                      <i className="fas fa-boxes text-mustard"></i>
                      <span>
                        Stock:{" "}
                        {selectedProduct.stock > 0
                          ? `${selectedProduct.stock} available`
                          : "Out of stock"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-dark">
                    <i className="fas fa-weight text-mustard"></i>
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
                        className="px-3 py-2 text-dark hover:bg-mustard/10"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-dark">
                        {quantity} {selectedProduct.unit}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-dark hover:bg-mustard/10"
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
                        ? "bg-white text-dark hover:bg-mustard hover:text-cream"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <i className="fas fa-cart-plus"></i>
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
                    <i className="fas fa-arrow-right"></i>
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