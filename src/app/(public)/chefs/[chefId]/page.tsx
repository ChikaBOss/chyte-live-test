'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// UPDATED CHEF PROFILE INTERFACE WITH PICKUP FIELDS
interface ChefProfile {
  _id: string;
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  // REPLACED: address?: string; with pickup fields
  pickupZone?: string;
  pickupAddress?: string;
  pickupPhone?: string;
  experience?: string;
  specialties?: string;
  avatarUrl?: string;
  instagram?: string;
  twitter?: string;
  minOrder?: number;
  businessHours?: any[];
  businessName?: string;
  approved?: boolean;
  ownerName?: string;
  category?: string;
}

interface Meal {
  id: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  serves?: number;
  preparationTime?: number;
  ingredients?: string[];
  chefId?: string;
  quantity?: number;
  unit?: string;
}

const ChefProfilePage = () => {
  const { chefId } = useParams() as { chefId?: string };
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [chef, setChef] = useState<ChefProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chefId) return;

    async function fetchChef() {
      try {
        setLoading(true);
        console.log("Fetching chef with ID:", chefId);

        const res = await fetch(`/api/chefs/${chefId}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Chef fetch error:", data);
          throw new Error(data?.error || 'Chef not found');
        }

        console.log("Chef data received:", data);
        setChef(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching chef:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchChef();
  }, [chefId]);

  useEffect(() => {
    if (!chefId) return;

    async function fetchMeals() {
      try {
        setMealsLoading(true);
        console.log("Fetching meals for chef:", chefId);

        const res = await fetch(`/api/meals/chef/${chefId}`);
        
        if (!res.ok) {
          console.log("No meals found or error fetching meals");
          setMeals([]);
          return;
        }

        const data = await res.json();
        console.log("Meals data received:", data);
        
        // Handle different response formats
        let mealsArray = [];
        if (Array.isArray(data)) {
          mealsArray = data;
        } else if (data.meals && Array.isArray(data.meals)) {
          mealsArray = data.meals;
        } else if (data.data && Array.isArray(data.data)) {
          mealsArray = data.data;
        }

        const mapped: Meal[] = mealsArray.map((m: any) => ({
          id: m._id?.toString?.() || m._id || m.id || `meal-${Math.random()}`,
          name: m.name || 'Untitled',
          price: m.price || 0,
          image: m.imageUrl || m.image || '/images/meal-placeholder.jpg',
          description: m.description || '',
          serves: m.serves,
          preparationTime: m.preparationTime,
          ingredients: m.ingredients || [],
          chefId: m.chefId || chefId,
          quantity: m.quantity || 1,
          unit: m.unit || 'portion',
        }));

        console.log("Mapped meals:", mapped);
        setMeals(mapped);
      } catch (err) {
        console.error("Error fetching meals:", err);
        setMeals([]);
      } finally {
        setMealsLoading(false);
      }
    }

    if (chefId) {
      fetchMeals();
    }
  }, [chefId]);

  const toNumber = (p: any) => {
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const n = Number(p.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const handleAddToCart = (meal: Meal) => {
    addToCart({
      id: meal.id,
      name: meal.name,
      price: toNumber(meal.price) * quantity,
      image: meal.image || '/images/meal-placeholder.jpg',
      description: meal.description || '',
      vendorId: chefId || '',
      vendorName: chef?.displayName || chef?.businessName || 'Chef',
      vendorBaseLocation: chef?.pickupZone || 'Eziobodo',
      vendorRole: 'chef',
      quantity: quantity,
    });
    setSelectedMeal(meal);
    setShowAddToCartModal(true);
    setTimeout(() => setShowAddToCartModal(false), 2500);
  };
  
  const handleOrderNow = (meal: Meal) => {
    addToCart({
      id: meal.id,
      name: meal.name,
      price: toNumber(meal.price) * quantity,
      image: meal.image || '/images/meal-placeholder.jpg',
      description: meal.description || '',
      vendorId: chefId || '',
      vendorName: chef?.displayName || chef?.businessName || 'Chef',
      vendorBaseLocation: chef?.pickupZone || 'Eziobodo',
      vendorRole: 'chef',
      quantity: quantity,
    });
    router.push('/checkout');
  };

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

  if (loading || mealsLoading)
    return (
      <section className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mustard border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-dark font-medium">Loading chef profile...</p>
        </div>
      </section>
    );

  if (error || !chef)
    return (
      <section className="min-h-screen bg-cream pt-20 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mt-4">Chef not found</h2>
          <p className="mt-2 text-dark">No chef found for ID: {String(chefId)}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-mustard text-cream px-6 py-2 rounded-lg font-medium hover:bg-olive-2 transition"
          >
            Back to Home
          </button>
        </div>
      </section>
    );

  return (
    <section className="min-h-screen bg-cream pt-20 pb-12 px-4 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Chef Header Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 rounded-2xl bg-white shadow-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {chef.avatarUrl ? (
              <img
                src={chef.avatarUrl}
                alt={chef.displayName || chef.businessName || 'Chef'}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-olive-2/10">
                👨‍🍳
              </div>
            )}
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-olive-2">
                  {chef.displayName || chef.businessName}
                </h1>
                
                {/* Display pickup zone and address */}
                <div className="flex flex-col items-center md:items-start gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-dark font-medium">
                      Pickup Area: {chef.pickupZone || "Eziobodo"}
                    </p>
                  </div>
                  {chef.pickupAddress && (
                    <p className="text-sm text-dark/70 ml-7">
                      {chef.pickupAddress}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-mustard mt-1">
                  {chef.category || 'Professional Chef'} • {chef.specialties || 'Various Cuisines'}
                </p>
              </div>
            </div>

            <p className="text-dark mt-4 text-lg leading-relaxed">
              {chef.bio || 'Professional chef offering catering services and homemade meals. Specializes in traditional and modern cuisine.'}
            </p>
            
            {/* Experience and services */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark">
              {chef.experience && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {chef.experience} years experience
                </span>
              )}
              {typeof chef.minOrder === 'number' && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Min order: ₦{chef.minOrder.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Pickup Phone: {chef.pickupPhone || chef.phone || "Not provided"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Meals Section Title */}
        <h2 className="text-2xl font-bold text-olive-2 mb-4">
          Signature Meals ({meals.length})
        </h2>

        {/* Meals List - BIGGER VERTICAL LIST for mobile, grid for desktop */}
        {meals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <svg className="w-16 h-16 text-mustard mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-dark text-lg">No meals available yet.</p>
            <p className="text-dark/70 mt-1">Check back soon for delicious offerings!</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                variants={itemVariants}
              >
                {/* VERTICAL LIST STYLE - ENLARGED for mobile */}
                <div className="md:hidden">
                  <div className="p-5 flex items-start gap-4">
                    {/* Larger thumbnail image - 24x24 */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <Image
                        src={meal.image || '/images/meal-placeholder.jpg'}
                        alt={meal.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    
                    {/* Content - larger text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-olive-2 text-lg line-clamp-2">
                        {meal.name}
                      </h3>
                      {meal.description && (
                        <p className="text-sm text-dark/70 line-clamp-2 mt-1">
                          {meal.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-bold text-dark text-lg">
                          ₦{toNumber(meal.price).toLocaleString()}
                        </p>
                        
                        {/* Add button - larger */}
                        <button
                          onClick={() => {
                            setSelectedMeal(meal);
                            setQuantity(1);
                            setShowDetailModal(true);
                          }}
                          className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DESKTOP GRID STYLE - keep your existing beautiful cards */}
                <div className="hidden md:block">
                  <div
                    className="relative h-48 cursor-pointer overflow-hidden"
                    onClick={() => {
                      setSelectedMeal(meal);
                      setShowDetailModal(true);
                    }}
                  >
                    <Image
                      src={meal.image || '/images/meal-placeholder.jpg'}
                      alt={meal.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-4 right-4 bg-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                      ₦{toNumber(meal.price).toLocaleString()}
                      {meal.unit && <span className="text-xs ml-1">/{meal.unit}</span>}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-xl text-olive-2 mb-2">{meal.name}</h3>
                    <p className="text-sm text-dark mb-4 line-clamp-2">
                      {meal.description || 'A delicious homemade meal prepared with fresh ingredients.'}
                    </p>

                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {meal.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <span key={idx} className="text-xs bg-cream text-dark px-2 py-1 rounded">
                              {ingredient}
                            </span>
                          ))}
                          {meal.ingredients.length > 3 && (
                            <span className="text-xs text-dark">+{meal.ingredients.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => {
                          setSelectedMeal(meal);
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
                        onClick={() => handleOrderNow(meal)}
                        className="px-4 py-2 bg-mustard text-cream rounded-full font-semibold hover:bg-olive-2 transition-colors duration-300 flex items-center gap-2"
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
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Added to Cart Modal */}
      <AnimatePresence>
        {showAddToCartModal && selectedMeal && (
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
                {quantity} {selectedMeal.unit} of {selectedMeal.name} has been added to your cart.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddToCartModal(false)}
                  className="flex-1 bg-cream text-dark border border-mustard py-2 rounded-lg font-medium hover:bg-mustard hover:text-cream transition"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push('/checkout')}
                  className="flex-1 bg-mustard text-cream py-2 rounded-lg font-medium hover:bg-olive-2 transition"
                >
                  Checkout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal Detail Modal with Ingredients */}
      <AnimatePresence>
        {showDetailModal && selectedMeal && (
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
                  src={selectedMeal.image || '/images/meal-placeholder.jpg'}
                  alt={selectedMeal.name}
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
                <h3 className="text-2xl font-bold text-olive-2 mb-2">{selectedMeal.name}</h3>
                <p className="text-dark mb-4">
                  {selectedMeal.description || 'A delicious meal prepared with fresh ingredients and authentic flavors.'}
                </p>

                {/* Ingredients Section */}
                {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-dark mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Ingredients:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeal.ingredients.map((ingredient, idx) => (
                        <span key={idx} className="text-sm bg-white text-dark px-3 py-1 rounded-full border border-mustard/20">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Details */}
                <div className="space-y-2 mb-4">
                  {selectedMeal.serves && (
                    <div className="flex items-center gap-2 text-dark">
                      <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Serves: {selectedMeal.serves} people</span>
                    </div>
                  )}
                  {selectedMeal.preparationTime && (
                    <div className="flex items-center gap-2 text-dark">
                      <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Prep time: {selectedMeal.preparationTime} mins</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-dark">
                    <svg className="w-5 h-5 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span>Unit: {selectedMeal.unit || 'portion'}</span>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="mb-6">
                  <label className="block text-dark font-medium mb-2">Select Quantity:</label>
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
                      ₦{(toNumber(selectedMeal.price) * quantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedMeal);
                      setShowDetailModal(false);
                    }}
                    className="py-3 bg-white text-dark rounded-lg font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center justify-center gap-2 border border-mustard/30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleOrderNow(selectedMeal);
                      setShowDetailModal(false);
                    }}
                    className="py-3 bg-mustard text-cream rounded-lg font-semibold hover:bg-olive-2 transition-colors duration-300 flex items-center justify-center gap-2"
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

export default ChefProfilePage;