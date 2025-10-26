'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// Define types
interface Rating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string; // To verify purchase
}

interface Chef {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  bio: string;
  meals: Meal[];
  ratings: Rating[];
}

interface Meal {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  chefId: string;
  date: string;
  items: Meal[];
  status: 'delivered' | 'cancelled' | 'preparing';
}

// Mock user data (in a real app, this would come from authentication)
const currentUser = {
  id: 'user123',
  name: 'Chidi',
  orders: [] as Order[]
};

const chefs: Chef[] = [
  {
    id: 'c1',
    name: 'Chef Amarachi',
    image: '/images/chef1.jpg',
    location: 'FUTO South Gate',
    rating: 4.8,
    bio: 'Chef Amarachi is known for creating healthy and delicious meals with a fusion of local and continental flavors.',
    meals: [
      { id: 'm1', name: 'Grilled Chicken & Yam', price: 2500, image: '/images/grilled-chicken.jpg' },
      { id: 'm2', name: 'Jollof Rice Deluxe', price: 1800, image: '/images/jollof.jpg' },
    ],
    ratings: [
      { id: 'r1', userId: 'user1', userName: 'Chisom', rating: 5, comment: 'The best jollof rice on campus!', date: '2023-10-15', orderId: 'order123' },
      { id: 'r2', userId: 'user2', userName: 'Emmanuel', rating: 4, comment: 'Great food, but delivery was a bit late', date: '2023-10-10', orderId: 'order124' },
      { id: 'r3', userId: 'user3', userName: 'Zainab', rating: 5, comment: 'Always consistent and delicious!', date: '2023-10-05', orderId: 'order125' },
    ],
  },
  {
    id: 'c2',
    name: 'Chef Emeka',
    image: '/images/chef2.jpg',
    location: 'FUTO North Junction',
    rating: 4.9,
    bio: 'Chef Emeka blends street food with fine dining. Popular for signature pepper soup and suya rice.',
    meals: [
      { id: 'm3', name: 'Pepper Soup', price: 2000, image: '/images/peppersoup.jpg' },
      { id: 'm4', name: 'Suya Rice Combo', price: 2300, image: '/images/suya.jpg' },
    ],
    ratings: [
      { id: 'r4', userId: 'user4', userName: 'Tunde', rating: 5, comment: 'The suya rice is to die for!', date: '2023-10-12', orderId: 'order126' },
      { id: 'r5', userId: 'user5', userName: 'Aisha', rating: 5, comment: 'Best pepper soup I\'ve ever had', date: '2023-10-08', orderId: 'order127' },
    ],
  },
];

const ChefProfilePage = () => {
  const { chefId } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [hasOrderedFromChef, setHasOrderedFromChef] = useState(false);

  const chef = chefs.find((c) => c.id === chefId);

  // Check if user has ordered from this chef (simulate loading user orders)
  useEffect(() => {
    // In a real app, this would be an API call to fetch user orders
    const userOrders: Order[] = [
      {
        id: 'order123',
        userId: currentUser.id,
        chefId: 'c1',
        date: '2023-10-15',
        items: [{ id: 'm1', name: 'Grilled Chicken & Yam', price: 2500, image: '/images/grilled-chicken.jpg' }],
        status: 'delivered'
      }
    ];
    
    setUserOrders(userOrders);
    const orderedFromChef = userOrders.some(order => 
      order.chefId === chefId && order.status === 'delivered'
    );
    setHasOrderedFromChef(orderedFromChef);
  }, [chefId]);

  if (!chef) {
    return (
      <section className="py-12 px-6 text-center text-red-600 text-xl">
        Chef not found.
      </section>
    );
  }

  // small util to ensure numeric price is saved to cart
  const toNumberPrice = (p: any) => {
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const cleaned = p.replace(/[^0-9.-]+/g, '');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  // ✅ FIXED addToCart to always send correct numeric price and vendor-like ids for grouping
  const handleOrderNow = (meal: Meal) => {
    addToCart({
      ...meal,
      price: toNumberPrice(meal.price),
      // provide fields checkout expects for grouping
      vendorId: chef.id,
      vendorName: chef.name,
      quantity: 1,
      chefId: chef.id,
      chefName: chef.name,
    } as any);
    router.push('/checkout');
  };

  const openMealDetail = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowDetailModal(true);
  };

  const closeMealDetail = () => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedMeal(null), 300);
  };

  const handleSubmitRating = () => {
    if (!hasOrderedFromChef) {
      alert("You need to place an order first before you can rate this chef.");
      return;
    }
    
    // In a real app, you would submit this to your backend
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
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
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full bg-mustard flex items-center justify-center text-cream text-4xl">
                {chef.name.charAt(0)}
              </div>
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-olive-2">{chef.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <i className="fas fa-map-marker-alt text-mustard"></i>
                    <p className="text-dark">{chef.location}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 bg-cream px-4 py-2 rounded-2xl shadow">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star ${i < Math.floor(chef.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      ></i>
                    ))}
                    <span className="text-mustard font-bold ml-1">{chef.rating}</span>
                  </div>
                  <span className="text-sm text-dark">{chef.ratings.length} reviews</span>
                  <button 
                    onClick={() => setShowRatingModal(true)}
                    className={`text-sm px-3 py-1 rounded-full mt-1 transition-colors ${
                      hasOrderedFromChef 
                        ? 'bg-mustard text-cream hover:bg-olive-2' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!hasOrderedFromChef}
                    title={hasOrderedFromChef ? "Rate this chef" : "Place an order first to rate this chef"}
                  >
                    {hasOrderedFromChef ? 'Rate Chef' : 'Order to Rate'}
                  </button>
                </div>
              </div>
              
              <p className="text-dark mt-4 text-lg leading-relaxed">{chef.bio}</p>
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
              Reviews ({chef.ratings.length})
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
              {chef.meals.map((meal) => (
                <motion.div 
                  key={meal.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div 
                    className="relative h-48 cursor-pointer overflow-hidden"
                    onClick={() => openMealDetail(meal)}
                  >
                    <div className="w-full h-full bg-mustard flex items-center justify-center text-cream text-2xl">
                      {meal.name}
                    </div>
                    <div className="absolute top-4 right-4 bg-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                      ₦{meal.price.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-olive-2 mb-2">{meal.name}</h3>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() =>
                          addToCart({
                            ...meal,
                            price: toNumberPrice(meal.price),
                            vendorId: chef.id,
                            vendorName: chef.name,
                            quantity: 1,
                            chefId: chef.id,
                            chefName: chef.name,
                          } as any)
                        }
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
                      hasOrderedFromChef 
                        ? 'bg-mustard text-cream hover:bg-olive-2' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!hasOrderedFromChef}
                    title={hasOrderedFromChef ? "Write a review" : "Place an order first to review this chef"}
                  >
                    <i className="fas fa-plus"></i> Write a Review
                  </button>
                </div>

                {chef.ratings.length === 0 ? (
                  <div className="text-center py-8 text-dark">
                    <i className="fas fa-comment-slash text-4xl text-mustard mb-3"></i>
                    <p>No reviews yet. Be the first to review after ordering!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {chef.ratings.map((rating) => (
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
      </section>

      {/* Meal Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedMeal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMealDetail}
          >
            <motion.div 
              className="bg-cream rounded-2xl overflow-hidden w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56 bg-mustard flex items-center justify-center text-cream text-xl">
                {selectedMeal.name}
                <button 
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream text-dark flex items-center justify-center"
                  onClick={closeMealDetail}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-olive-2 mb-2">{selectedMeal.name}</h3>
                <p className="text-dark mb-4">A delicious meal prepared by {chef.name} with fresh ingredients and authentic flavors.</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xl font-bold text-mustard">₦{selectedMeal.price.toLocaleString()}</div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="text-dark">4.8 (120 reviews)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart({
                        ...selectedMeal,
                        price: toNumberPrice(selectedMeal.price),
                        vendorId: chef.id,
                        vendorName: chef.name,
                        quantity: 1,
                        chefId: chef.id,
                        chefName: chef.name,
                      } as any);
                      closeMealDetail();
                    }}
                    className="py-3 bg-white text-dark rounded-lg font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-cart-plus"></i>
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => {
                      handleOrderNow(selectedMeal);
                      closeMealDetail();
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
                  <h3 className="text-2xl font-bold text-olive-2">Rate Chef {chef.name}</h3>
                  <button 
                    className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center"
                    onClick={() => setShowRatingModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                {!hasOrderedFromChef ? (
                  <div className="text-center py-8">
                    <i className="fas fa-shopping-basket text-4xl text-mustard mb-4"></i>
                    <h4 className="text-xl font-bold text-dark mb-2">Order First to Review</h4>
                    <p className="text-dark mb-6">You need to place an order with this chef before you can leave a review.</p>
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
                        placeholder="Share your experience with this chef..."
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
    </>
  );
};

export default ChefProfilePage;