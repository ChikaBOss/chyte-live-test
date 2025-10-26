'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

// Define types
interface Rating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
}

interface Vendor {
  id: string;
  name: string;
  image: string;
  location: string;
  category: string;
  specialty: string;
  rating: number;
  about: string;
  meals: Meal[];
  ratings: Rating[];
}

interface Meal {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface Order {
  id: string;
  userId: string;
  vendorId: string;
  date: string;
  items: Meal[];
  status: 'delivered' | 'cancelled' | 'preparing';
}

// Define params type for the [vendorId] route
type VendorParams = {
  vendorId?: string;
};

// Mock user data
const currentUser = {
  id: 'user123',
  name: 'Chidi',
  orders: [] as Order[],
};

// Vendor data from VendorProfilePage
const vendors: Vendor[] = [
  {
    id: 'v1',
    name: 'SEKANI Foods',
    image: '/images/sekani.jpg',
    category: 'Traditional',
    specialty: 'Abacha, Soup & Local Meals',
    location: 'Eziobodo',
    rating: 4.9,
    about: 'SEKANI is one of the top-rated traditional food vendors in Eziobodo. Known for fresh and flavorful meals served daily. We use only the finest ingredients and traditional cooking methods.',
    meals: [
      {
        id: 'm1',
        name: 'Abacha with Fish',
        price: 1200,
        image: '/images/abacha.jpg',
        description: 'Fresh abacha with dried fish and garden egg sauce',
      },
      {
        id: 'm2',
        name: 'Egusi Soup & Fufu',
        price: 1500,
        image: '/images/egusi.jpg',
        description: 'Rich egusi soup with assorted meat and smooth fufu',
      },
      {
        id: 'm3',
        name: 'Jollof Rice with Chicken',
        price: 1800,
        image: '/images/jollof.jpg',
        description: 'Flavorful jollof rice with well-seasoned chicken',
      },
      {
        id: 'm4',
        name: 'Ofe Onugbu',
        price: 1300,
        image: '/images/onugbu.jpg',
        description: 'Bitterleaf soup with assorted meat and fufu',
      },
    ],
    ratings: [
      { id: 'r1', userId: 'user1', userName: 'Chisom', rating: 5, comment: 'Amazing abacha, so fresh!', date: '2023-10-15', orderId: 'order123' },
      { id: 'r2', userId: 'user2', userName: 'Emmanuel', rating: 4, comment: 'Great egusi, but portion could be bigger', date: '2023-10-10', orderId: 'order124' },
    ],
  },
  {
    id: 'v2',
    name: 'Futo Cafe',
    image: '/images/nkechi.jpg',
    category: 'Traditional',
    specialty: 'Oha Soup, Okpa',
    location: 'Ihiagwa',
    rating: 4.7,
    about: 'Futo Cafe is famous for authentic Igbo meals and consistent quality. We bring the taste of home to your doorstep.',
    meals: [
      {
        id: 'm5',
        name: 'Oha Soup & Semovita',
        price: 1800,
        image: '/images/oha.jpg',
        description: 'Traditional oha soup with smooth semovita',
      },
      {
        id: 'm6',
        name: 'Okpa & Zobo Drink',
        price: 800,
        image: '/images/okpa.jpg',
        description: 'Freshly baked okpa with refreshing zobo drink',
      },
    ],
    ratings: [
      { id: 'r3', userId: 'user3', userName: 'Zainab', rating: 5, comment: 'Oha soup was fantastic!', date: '2023-10-12', orderId: 'order125' },
    ],
  },
  {
    id: 'v3',
    name: 'Sonic Foods',
    image: '/images/emeka.jpg',
    category: 'Modern Local Fusion',
    specialty: 'Nkwobi, Pepper Soup',
    location: 'FUTO South Gate',
    rating: 4.8,
    about: 'Sonic blends modern culinary techniques with local recipes to create unique flavors that delight the palate.',
    meals: [
      {
        id: 'm7',
        name: 'Nkwobi',
        price: 2000,
        image: '/images/nkwobi.jpg',
        description: 'Spicy cow foot delicacy served with palm wine',
      },
      {
        id: 'm8',
        name: 'Catfish Pepper Soup',
        price: 2500,
        image: '/images/peppersoup.jpg',
        description: 'Hot and spicy catfish pepper soup',
      },
    ],
    ratings: [
      { id: 'r4', userId: 'user4', userName: 'Tunde', rating: 5, comment: 'Nkwobi is a must-try!', date: '2023-10-08', orderId: 'order126' },
    ],
  },
];

const VendorProfilePage = () => {
  // Use the custom params type
  const params = useParams<VendorParams>();
  const { vendorId } = params || {};
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [hasOrderedFromVendor, setHasOrderedFromVendor] = useState(false);

  const vendor = vendors.find((v) => v.id === (vendorId || ''));

  // Check if user has ordered from this vendor
  useEffect(() => {
    const userOrders: Order[] = [
      {
        id: 'order123',
        userId: currentUser.id,
        vendorId: 'v1',
        date: '2023-10-15',
        items: [{ id: 'm1', name: 'Abacha with Fish', price: 1200, image: '/images/abacha.jpg', description: 'Fresh abacha with dried fish and garden egg sauce' }],
        status: 'delivered',
      },
    ];
    setUserOrders(userOrders);
    const orderedFromVendor = userOrders.some(order => order.vendorId === (vendorId || '') && order.status === 'delivered');
    setHasOrderedFromVendor(orderedFromVendor);
  }, [vendorId]);

  // Debugging vendorId
  console.log('vendorId:', vendorId);

  if (!vendor) {
    return (
      <section className="min-h-screen py-12 px-6 text-center text-red-600 bg-cream flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mt-4">Vendor not found</h2>
          <p className="mt-2">No vendor found for ID: {String(vendorId)}. Available IDs: v1, v2, v3.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-mustard text-cream px-6 py-2 rounded-lg font-medium hover:bg-olive-2 transition"
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  // Fix price to ensure numeric value
  const toNumberPrice = (p: any) => {
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const cleaned = p.replace(/[^0-9.-]+/g, '');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const handleAddToCart = (meal: Meal) => {
    addToCart({
      ...meal,
      price: toNumberPrice(meal.price),
      vendorId: vendor.id,
      vendorName: vendor.name,
      quantity: 1,
    });
    setSelectedMeal(meal);
    setShowAddToCartModal(true);
    setTimeout(() => setShowAddToCartModal(false), 2500);
  };

  const handleOrderNow = (meal: Meal) => {
    addToCart({
      ...meal,
      price: toNumberPrice(meal.price),
      vendorId: vendor.id,
      vendorName: vendor.name,
      quantity: 1,
    });
    router.push('/checkout');
  };

  const handleSubmitRating = () => {
    if (!hasOrderedFromVendor) {
      alert("You need to place an order first before you can rate this vendor.");
      return;
    }
    alert(`Thanks for your ${userRating} star rating! Comment: ${userComment}`);
    setShowRatingModal(false);
    setUserRating(0);
    setUserComment('');
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
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Image
              src={vendor.image}
              alt={vendor.name}
              fill
              className="object-cover"
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-olive-2">{vendor.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <i className="fas fa-map-marker-alt text-mustard"></i>
                  <p className="text-dark">{vendor.location}</p>
                </div>
                <p className="text-sm text-mustard mt-1">{vendor.category} • {vendor.specialty}</p>
              </div>

              <div className="flex flex-col items-center gap-2 bg-cream px-4 py-2 rounded-2xl shadow">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    ></i>
                  ))}
                  <span className="text-mustard font-bold ml-1">{vendor.rating}</span>
                </div>
                <span className="text-sm text-dark">{vendor.ratings.length} reviews</span>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className={`text-sm px-3 py-1 rounded-full mt-1 transition-colors ${
                    hasOrderedFromVendor
                      ? 'bg-mustard text-cream hover:bg-olive-2'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hasOrderedFromVendor}
                  title={hasOrderedFromVendor ? 'Rate this vendor' : 'Place an order first to rate this vendor'}
                >
                  {hasOrderedFromVendor ? 'Rate Vendor' : 'Order to Rate'}
                </button>
              </div>
            </div>

            <p className="text-dark mt-4 text-lg leading-relaxed">{vendor.about}</p>
          </div>
        </motion.div>

        {/* Tabs for Meals and Reviews */}
        <div className="flex border-b border-mustard/20 mb-8">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'meals' ? 'text-mustard border-b-2 border-mustard' : 'text-dark'}`}
            onClick={() => setActiveTab('meals')}
          >
            Signature Meals
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-mustard border-b-2 border-mustard' : 'text-dark'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({vendor.ratings.length})
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
            {vendor.meals.map((meal) => (
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
                    src={meal.image}
                    alt={meal.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                    ₦{toNumberPrice(meal.price).toLocaleString()}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-olive-2 mb-2">{meal.name}</h3>
                  <p className="text-sm text-dark mb-4">{meal.description}</p>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handleAddToCart(meal)}
                      className="px-4 py-2 bg-cream text-dark rounded-full font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center gap-2"
                    >
                      <i className="fas fa-cart-plus"></i>
                      Add to Cart
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
            ))}
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
                  onClick={() => setShowRatingModal(true)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 ${
                    hasOrderedFromVendor
                      ? 'bg-mustard text-cream hover:bg-olive-2'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hasOrderedFromVendor}
                  title={hasOrderedFromVendor ? 'Write a review' : 'Place an order first to review this vendor'}
                >
                  <i className="fas fa-plus"></i> Write a Review
                </button>
              </div>

              {vendor.ratings.length === 0 ? (
                <div className="text-center py-8 text-dark">
                  <i className="fas fa-comment-slash text-4xl text-mustard mb-3"></i>
                  <p>No reviews yet. Be the first to review after ordering!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {vendor.ratings.map((rating) => (
                    <div key={rating.id} className="border-b border-mustard/20 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-dark">{rating.userName}</h4>
                          <p className="text-sm text-dark/70">{rating.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-dark mt-2">{rating.comment}</p>
                      <div className="mt-2 text-xs text-mustard flex items-center gap-1">
                        <i className="fas fa-check-circle"></i>
                        <span>Verified Purchase</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <p className="mt-2 text-dark">{selectedMeal.name} has been added to your cart.</p>
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

      {/* Meal Detail Modal */}
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
                  src={selectedMeal.image}
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
                <p className="text-dark mb-4">A delicious meal prepared by {vendor.name} with fresh ingredients and authentic flavors.</p>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-xl font-bold text-mustard">₦{toNumberPrice(selectedMeal.price).toLocaleString()}</div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="text-dark">4.8 (120 reviews)</span>
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

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRatingModal(false)}
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
                  <h3 className="text-2xl font-bold text-olive-2">Rate Vendor {vendor.name}</h3>
                  <button
                    className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center"
                    onClick={() => setShowRatingModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {!hasOrderedFromVendor ? (
                  <div className="text-center py-8">
                    <i className="fas fa-shopping-basket text-4xl text-mustard mb-4"></i>
                    <h4 className="text-xl font-bold text-dark mb-2">Order First to Review</h4>
                    <p className="text-dark mb-6">You need to place an order with this vendor before you can leave a review.</p>
                    <button
                      onClick={() => setShowRatingModal(false)}
                      className="px-6 py-2 bg-mustard text-cream rounded-full font-semibold hover:bg-olive-2 transition-colors"
                    >
                      Browse Meals
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-dark font-medium mb-2">Your Rating</label>
                      <div className="flex gap-1 text-2xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className={`p-1 ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="comment" className="block text-dark font-medium mb-2">Your Review</label>
                      <textarea
                        id="comment"
                        rows={4}
                        className="w-full p-3 border border-mustard/30 rounded-lg focus:ring-2 focus:ring-mustard focus:border-transparent"
                        placeholder="Share your experience with this vendor..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmitRating}
                      disabled={userRating === 0}
                      className="w-full py-3 bg-mustard text-cream rounded-lg font-semibold hover:bg-olive-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Review
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VendorProfilePage;