'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

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

interface Rating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  orderId?: string;
}

const ChefProfilePage = () => {
  const { chefId } = useParams() as { chefId?: string };
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'meals' | 'reviews'>('meals');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [chef, setChef] = useState<ChefProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chefId) return;

    async function fetchChef() {
      try {
        setLoading(true);

        const res = await fetch(`/api/chefs/${chefId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || 'Chef not found');

        // Log to see what fields we're getting from API
        console.log("Chef data received:", data);
        console.log("Pickup fields:", {
          pickupZone: data.pickupZone,
          pickupAddress: data.pickupAddress,
          pickupPhone: data.pickupPhone
        });

        setChef(data);
      } catch (err: any) {
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

        const res = await fetch(`/api/meals/chef/${chefId}`);
        const payload = await safeJson(res);

        if (!res.ok) {
          setMeals([]);
          return;
        }

        const mealsData = Array.isArray(payload) ? payload : [];

        const filtered = mealsData.filter((m: any) => {
          return (
            m.chefId === chefId ||
            m.chefId?.toString?.() === chefId ||
            m.chefId?._id === chefId
          );
        });

        const mapped: Meal[] = filtered.map((m: any) => ({
          id: m._id?.toString?.() ?? m._id,
          name: m.name ?? 'Untitled',
          price: m.price ?? 0,
          image: m.imageUrl || m.image || '/images/meal-placeholder.jpg',
          description: m.description || '',
          serves: m.serves,
          preparationTime: m.preparationTime,
          ingredients: m.ingredients || [],
          chefId: m.chefId,
          quantity: m.quantity || 1,
          unit: m.unit || 'liter',
        }));

        setMeals(mapped);
      } catch (err) {
        setMeals([]);
      } finally {
        setMealsLoading(false);
      }
    }

    fetchMeals();
  }, [chefId]);

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

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
      vendorName: chef?.displayName || chef?.businessName || '',
      vendorBaseLocation: chef?.pickupZone || 'Eziobodo',
      vendorRole: 'chef', // 🔥 ADDED: Chef role
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
      vendorName: chef?.displayName || chef?.businessName || '',
      vendorBaseLocation: chef?.pickupZone || 'Eziobodo',
      vendorRole: 'chef', // 🔥 ADDED: Chef role
      quantity: quantity,
    });
    router.push('/checkout');
  };

  const handleBookChef = async () => {
    if (!bookingDate || !bookingTime || !bookingGuests) {
      alert('Please fill in all required fields: Date, Time, and Number of Guests.');
      return;
    }

    if (bookingGuests < 1) {
      alert('Number of guests must be at least 1.');
      return;
    }

    setBookingLoading(true);

    const payload = {
      chefId,
      date: bookingDate,
      time: bookingTime,
      guests: bookingGuests,
      notes: `Guests: ${bookingGuests}. ${bookingNotes || ''}`,
    };

    try {
      console.log('Booking request ->', payload);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text().catch(() => '');
      let result: any = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        console.warn('Booking response not JSON:', raw);
        result = { raw };
      }

      console.log('Booking response status:', res.status, 'body:', result);

      if (res.status === 401) {
        const msg = (result && (result.error || result.message)) ? (result.error || result.message) : 'Please login to book a chef.';
        if (confirm(`${msg}\n\nWould you like to login now?`)) {
          signIn();
        }
        throw new Error(msg);
      }

      if (!res.ok) {
        const errMsg = (result && (result.error || result.message)) ? (result.error || result.message) : `Booking failed (${res.status})`;
        throw new Error(errMsg);
      }

      const successMsg = (result && (result.message || result.success)) ? (result.message || 'Booking request sent!') : 'Booking request sent!';
      alert(`✅ ${successMsg}`);

      setShowBookingModal(false);
      resetBookingForm();
    } catch (err: any) {
      console.error('Booking error (client):', err);
      alert(`❌ ${err?.message || 'Failed to send booking request. Please try again.'}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingForm = () => {
    setBookingDate('');
    setBookingTime('');
    setBookingGuests(1);
    setBookingNotes('');
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
                
                {/* UPDATED: Display pickup zone and address exactly like vendor page */}
                <div className="flex flex-col items-center md:items-start gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-location-dot text-mustard"></i>
                    <p className="text-dark font-medium">
                      Pickup Area: {chef.pickupZone || "Location not specified"}
                    </p>
                  </div>
                  {chef.pickupAddress && (
                    <p className="text-sm text-dark/70 ml-6">
                      {chef.pickupAddress}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-mustard mt-1">
                  {chef.category || 'Professional Chef'} • {chef.specialties || 'Various Cuisines'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 bg-cream px-4 py-2 rounded-2xl shadow">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    ></i>
                  ))}
                  <span className="text-mustard font-bold ml-1">4.5</span>
                </div>
                <span className="text-sm text-dark">0 reviews</span>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="text-sm px-3 py-1 rounded-full mt-1 bg-green-600 text-cream hover:bg-green-700 transition-colors"
                >
                  Book Chef
                </button>
              </div>
            </div>

            <p className="text-dark mt-4 text-lg leading-relaxed">
              {chef.bio || 'Professional chef offering catering services and homemade meals. Specializes in traditional and modern cuisine.'}
            </p>
            
            {/* Experience and services with added pickup phone */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark">
              {chef.experience && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-clock text-mustard"></i>
                  {chef.experience} years experience
                </span>
              )}
              {typeof chef.minOrder === 'number' && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-shopping-bag text-mustard"></i>
                  Min order: ₦{chef.minOrder.toLocaleString()}
                </span>
              )}
              {/* ADDED: Pickup phone display */}
              <span className="flex items-center gap-1">
                <i className="fas fa-phone text-mustard"></i>
                Pickup Phone: {chef.pickupPhone || "Not provided"}
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-utensils text-mustard"></i>
                Available for catering
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs for Meals and Reviews */}
        <div className="flex border-b border-mustard/20 mb-8">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'meals' ? 'text-mustard border-b-2 border-mustard' : 'text-dark'}`}
            onClick={() => setActiveTab('meals')}
          >
            Signature Meals ({meals.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-mustard border-b-2 border-mustard' : 'text-dark'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews (0)
          </button>
        </div>

        {/* Meals Tab Content */}
        {activeTab === 'meals' && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {meals.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fas fa-utensils text-4xl text-mustard mb-3"></i>
                <p className="text-dark text-lg">No meals available yet.</p>
                <p className="text-dark/70 mt-1">Check back soon for delicious offerings!</p>
              </div>
            ) : (
              meals.map((meal) => (
                <motion.div
                  key={meal.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
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
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                      ₦{toNumber(meal.price).toLocaleString()}
                      {meal.unit && <span className="text-xs ml-1">/{meal.unit}</span>}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-xl text-olive-2 mb-2">{meal.name}</h3>
                    <p className="text-sm text-dark mb-4">
                      {meal.description || 'A delicious homemade meal prepared with fresh ingredients.'}
                    </p>

                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-mustard font-semibold mb-1">Ingredients:</p>
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
                        <i className="fas fa-info-circle"></i>
                        Details
                      </button>
                      <button
                        onClick={() => handleOrderNow(meal)}
                        className="px-4 py-2 bg-mustard text-cream rounded-full font-semibold hover:bg-olive-2 transition-colors duration-300 flex items-center gap-2"
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
        {activeTab === 'reviews' && (
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
                  title="Place an order first to review this chef"
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
        {showAddToCartModal && selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
              <h3 className="text-xl font-bold text-olive-2 mt-4">Added to Cart!</h3>
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
                />
                <button
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream text-dark flex items-center justify-center"
                  onClick={() => setShowDetailModal(false)}
                >
                  <i className="fas fa-times"></i>
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
                    <h4 className="font-semibold text-dark mb-2">
                      <i className="fas fa-carrot text-mustard mr-2"></i>
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
                      <i className="fas fa-users text-mustard"></i>
                      <span>Serves: {selectedMeal.serves} people</span>
                    </div>
                  )}
                  {selectedMeal.preparationTime && (
                    <div className="flex items-center gap-2 text-dark">
                      <i className="fas fa-clock text-mustard"></i>
                      <span>Prep time: {selectedMeal.preparationTime} mins</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-dark">
                    <i className="fas fa-weight text-mustard"></i>
                    <span>Unit: {selectedMeal.unit || 'liter'}</span>
                  </div>
                </div>

                {/* Quantity Selection for Liter-based Meals */}
                <div className="mb-6">
                  <label className="block text-dark font-medium mb-2">Select Quantity:</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-mustard/30 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-dark hover:bg-mustard/10"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-dark">{quantity} {selectedMeal.unit}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-dark hover:bg-mustard/10"
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
                    className="py-3 bg-white text-dark rounded-lg font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-cart-plus"></i>
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
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              className="bg-cream rounded-2xl overflow-hidden w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-olive-2">
                    <i className="fas fa-calendar-alt text-mustard mr-2"></i>
                    Book Chef {chef?.displayName}
                  </h3>
                  <button
                    className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center"
                    onClick={() => setShowBookingModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-dark font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-3 border border-mustard/30 rounded-lg focus:ring-2 focus:ring-mustard focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Time *</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-3 border border-mustard/30 rounded-lg focus:ring-2 focus:ring-mustard focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Number of Guests *</label>
                    <div className="flex items-center border border-mustard/30 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBookingGuests(Math.max(1, bookingGuests - 1))}
                        className="px-3 py-2 text-dark hover:bg-mustard/10"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-dark">{bookingGuests} guests</span>
                      <button
                        type="button"
                        onClick={() => setBookingGuests(bookingGuests + 1)}
                        className="px-3 py-2 text-dark hover:bg-mustard/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Special Requests</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-mustard/30 rounded-lg focus:ring-2 focus:ring-mustard focus:border-transparent"
                      placeholder="Any dietary restrictions, preferred cuisine, etc..."
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleBookChef}
                      disabled={!bookingDate || !bookingTime || bookingLoading}
                      className="w-full py-3 bg-green-600 text-cream rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          Send Booking Request
                        </>
                      )}
                    </button>
                    <p className="text-xs text-dark/60 mt-2 text-center">
                      The chef will contact you to confirm availability and discuss details
                    </p>
                  </div>
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