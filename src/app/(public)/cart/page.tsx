"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  TrashIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";

/* ---- Types ---- */
type CartItem = {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  vendorId?: string;
  vendorName?: string;
  vendorBaseLocation?: string;
  vendorRole?: string; // 🔥 ADDED
};

type CartContextShape = {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void; // 🔥 ADDED
  getTotal: () => number; // 🔥 ADDED
};

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity, getTotal } =
    useCart() as unknown as CartContextShape;

  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    (cart ?? []).reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = item.quantity || 1;
      return acc;
    }, {})
  );

  // Sync quantities when cart changes
  useEffect(() => {
    setQuantities((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const item of cart) {
        if (next[item.id] == null) next[item.id] = item.quantity || 1;
      }
      for (const key of Object.keys(next)) {
        if (!cart.find((i) => i.id === key)) delete next[key];
      }
      return next;
    });
  }, [cart]);

  // ✅ Update quantity - use context updateQuantity instead
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
    setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
  };

  // ✅ Fix NaN or 0 prices
  const safePrice = (price: number | string | undefined) => {
    const num = Number(price);
    return !isNaN(num) && num > 0 ? num : 0;
  };

  // Use context's getTotal for consistency
  const totalPrice = getTotal();

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-cream"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <ShoppingBagIcon className="w-24 h-24 text-dark/30 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-dark mb-4">Your cart is empty</h2>
        <p className="text-dark/70 mb-8 max-w-md">
          It looks like you haven&apos;t added any items to your cart yet. Start
          shopping to find amazing products!
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-dark text-cream rounded-xl font-semibold hover:bg-green transition-all duration-300"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-dark">Your Shopping Cart</h1>
          <div className="flex flex-col items-end">
            <span className="text-dark/70">
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </span>
            <span className="text-xs text-dark/50">
              {cart.map(item => item.vendorRole).filter(Boolean).length > 0 && 
                `Roles: ${Array.from(new Set(cart.map(item => item.vendorRole).filter(Boolean))).join(', ')}`
              }
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {cart.map((item, index) => {
                const price = safePrice(item.price);
                const qty = quantities[item.id] ?? item.quantity ?? 1;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-5 mb-5 border border-white/20 relative overflow-hidden"
                  >
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-4 right-4 p-1.5 text-dark/50 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      aria-label="Remove item"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col sm:flex-row gap-5">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        )}
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-lg text-dark">
                            {item.name}
                          </h3>
                          {item.vendorRole && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.vendorRole === 'chef' ? 'bg-yellow-100 text-yellow-800' :
                              item.vendorRole === 'vendor' ? 'bg-blue-100 text-blue-800' :
                              item.vendorRole === 'pharmacy' ? 'bg-purple-100 text-purple-800' :
                              item.vendorRole === 'topvendor' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.vendorRole}
                            </span>
                          )}
                        </div>

                        {/* Vendor Information */}
                        {item.vendorName && (
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="inline-block text-xs bg-cream border border-dark/10 text-dark/70 px-2 py-0.5 rounded-full w-fit">
                              {item.vendorName}
                            </span>
                            {item.vendorBaseLocation && (
                              <span className="text-xs text-dark/50">
                                📍 {item.vendorBaseLocation}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-green font-semibold mt-2 mb-4">
                          ₦{price.toLocaleString()}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-dark/20 rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, qty - 1)
                              }
                              className="p-2 text-dark/70 hover:bg-dark/5 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-1 font-medium">{qty}</span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, qty + 1)
                              }
                              className="p-2 text-dark/70 hover:bg-dark/5 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-dark font-semibold">
                            ₦{(price * qty).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-dark/70 hover:text-dark transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Continue Shopping
              </Link>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6"
          >
            <h2 className="text-xl font-bold text-dark mb-6 pb-4 border-b border-dark/10">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => {
                const price = safePrice(item.price);
                const qty = quantities[item.id] ?? item.quantity ?? 1;
                return (
                  <div key={item.id} className="flex justify-between text-dark/70 text-sm">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.name} × {qty}
                      </div>
                      <div className="text-xs text-dark/50 truncate">
                        {item.vendorName}
                        {item.vendorRole && (
                          <span className={`ml-1 px-1 rounded ${
                            item.vendorRole === 'chef' ? 'bg-yellow-50 text-yellow-700' :
                            item.vendorRole === 'vendor' ? 'bg-blue-50 text-blue-700' :
                            item.vendorRole === 'pharmacy' ? 'bg-purple-50 text-purple-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {item.vendorRole}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">₦{(price * qty).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-dark/10">
              <div className="flex justify-between text-dark">
                <span>Subtotal</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-dark">
                <span>
                  Items
                  <span className="text-xs text-dark/50 block">
                    {cart.length} unique items
                  </span>
                </span>
                <span>{cart.reduce((sum, item) => sum + (quantities[item.id] || item.quantity || 1), 0)} total</span>
              </div>

              <div className="flex justify-between text-lg font-bold text-dark pt-3 border-t border-dark/10">
                <span>Total</span>
                <span className="text-green-600">₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Vendor Summary */}
            <div className="mt-6 p-4 bg-cream rounded-xl border border-dark/10">
              <h3 className="font-semibold text-dark mb-2">Vendors in Cart</h3>
              <div className="space-y-1 text-sm">
                {Array.from(new Set(cart.map(item => item.vendorName).filter(Boolean))).map((vendorName, index) => {
                  const vendorItems = cart.filter(item => item.vendorName === vendorName);
                  const vendorRole = vendorItems[0]?.vendorRole;
                  return (
                    <div key={index} className="flex justify-between">
                      <span>
                        {vendorName}
                        {vendorRole && (
                          <span className={`ml-1 text-xs px-1 rounded ${
                            vendorRole === 'chef' ? 'bg-yellow-100 text-yellow-800' :
                            vendorRole === 'vendor' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {vendorRole}
                          </span>
                        )}
                      </span>
                      <span>{vendorItems.length} item{vendorItems.length > 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <Link
                href="/checkout"
                className="block w-full text-center bg-dark text-cream py-3.5 rounded-xl font-semibold hover:bg-green transition-all duration-300"
              >
                Proceed to Checkout
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 border border-dark/20 text-dark/70 rounded-xl font-semibold hover:bg-red-50 hover:text-red-500 transition-all duration-300"
              >
                <TrashIcon className="w-5 h-5" />
                Clear Cart
              </motion.button>
            </div>

            {/* Debug info (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 mb-1">🛒 Cart Debug</h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Vendor Roles: {Array.from(new Set(cart.map(item => item.vendorRole).filter(Boolean))).join(', ') || 'None'}</div>
                  <div>Vendor IDs: {Array.from(new Set(cart.map(item => item.vendorId).filter(Boolean))).join(', ') || 'None'}</div>
                  <div>Total Items: {cart.reduce((sum, item) => sum + (quantities[item.id] || 1), 0)}</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}