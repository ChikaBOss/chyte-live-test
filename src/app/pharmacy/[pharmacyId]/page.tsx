"use client";

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// Temporary static pharmacy data
const pharmacyData = {
  id: 'p1',
  name: 'Campus Meds',
  image: '/images/pharmacy1.jpg',
  location: 'FUTO North Gate',
  specialty: 'Prescription Drugs, Supplements, First Aid',
  rating: 4.7,
  about: 'Campus Meds is your reliable campus pharmacy offering quality medications, health consultations, and wellness products.',
  ratings: [
    {
      id: 'r1',
      userId: 'user1',
      userName: 'Chidi',
      rating: 5,
      comment: 'Great service and authentic medications!',
      date: '2023-10-15'
    },
    {
      id: 'r2',
      userId: 'user2',
      userName: 'Amara',
      rating: 4,
      comment: 'Good prices but sometimes crowded',
      date: '2023-10-10'
    }
  ],
  products: [
    {
      id: 'pr1',
      name: 'Paracetamol 500mg',
      price: '₦250',
      image: '/images/paracetamol.jpg',
    },
    {
      id: 'pr2',
      name: 'Vitamin C Tablets',
      price: '₦500',
      image: '/images/vitamin-c.jpg',
    },
    {
      id: 'pr3',
      name: 'Multivitamin Complex',
      price: '₦1,200',
      image: '/images/multivitamin.jpg',
    },
    {
      id: 'pr4',
      name: 'First Aid Kit',
      price: '₦3,500',
      image: '/images/firstaid.jpg',
    },
  ],
};

const parsePriceToNumber = (priceStr: string | number) => {
  // If already a number, return it.
  if (typeof priceStr === 'number') return priceStr;
  // Remove ₦ and commas then parse to number. If parse fails return 0.
  const cleaned = String(priceStr).replace(/[^0-9.-]+/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const PharmacyProfilePage = () => {
  const { pharmacyId } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  const openProductDetail = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductDetail = () => {
    setShowProductModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleOrderNow = (product: any) => {
    // ensure price stored in cart is numeric
    addToCart({
      ...product,
      price: parsePriceToNumber(product.price),
      pharmacyId: pharmacyData.id,
      pharmacyName: pharmacyData.name,
      quantity: 1,
    } as any);
    router.push('/checkout');
  };

  const handleSubmitRating = () => {
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
          {/* Pharmacy Header Section */}
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 rounded-2xl bg-white shadow-lg"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div 
              className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full bg-mustard flex items-center justify-center text-cream text-4xl">
                <i className="fas fa-clinic-medical"></i>
              </div>
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-olive-2">{pharmacyData.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <i className="fas fa-map-marker-alt text-mustard"></i>
                    <p className="text-dark">{pharmacyData.location}</p>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < Math.floor(pharmacyData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        ></i>
                      ))}
                      <span className="text-dark font-medium ml-1">{pharmacyData.rating}</span>
                    </div>
                    <span className="text-dark">({pharmacyData.ratings.length} reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-cream px-4 py-2 rounded-full shadow">
                    <span className="text-sm text-mustard font-medium">Open ⋅ Closes 9PM</span>
                  </div>
                  <button 
                    onClick={() => setShowRatingModal(true)}
                    className="bg-mustard text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-olive-2 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-star"></i>
                    Rate Pharmacy
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <i className="fas fa-stethoscope text-mustard"></i>
                  <span className="text-dark font-medium">{pharmacyData.specialty}</span>
                </div>
                <p className="text-dark mt-2 text-lg leading-relaxed">{pharmacyData.about}</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs for Products and Reviews */}
          <div className="flex border-b border-mustard/20 mb-8">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-mustard border-b-2 border-mustard' : 'text-dark'}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-mustard border-b-2 border-mustard' : 'text-dark'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({pharmacyData.ratings.length})
            </button>
          </div>

          {/* Products Tab Content */}
          {activeTab === 'products' && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {pharmacyData.products.map((product) => (
                <motion.div 
                  key={product.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div 
                    className="relative h-48 cursor-pointer overflow-hidden"
                    onClick={() => openProductDetail(product)}
                  >
                    <div className="w-full h-full bg-mustard flex items-center justify-center text-cream text-2xl">
                      <i className="fas fa-pills"></i>
                    </div>
                    <div className="absolute top-4 right-4 bg-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                      {product.price}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-olive-2 mb-2">{product.name}</h3>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => addToCart({
                          ...product,
                          price: parsePriceToNumber(product.price),
                          pharmacyId: pharmacyData.id,
                          pharmacyName: pharmacyData.name,
                          quantity: 1,
                        } as any)}
                        className="px-4 py-2 bg-cream text-dark rounded-full font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center gap-2"
                      >
                        <i className="fas fa-cart-plus"></i>
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={() => handleOrderNow(product)}
                        className="px-4 py-2 bg-mustard text-cream rounded-full font-semibold hover:bg-olive-2 transition-colors duration-300 flex items-center gap-2"
                      >
                        Buy Now
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
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-olive-2">Customer Reviews</h3>
                  <button 
                    onClick={() => setShowRatingModal(true)}
                    className="px-4 py-2 bg-mustard text-cream rounded-full font-semibold hover:bg-olive-2 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> Write a Review
                  </button>
                </div>

                {pharmacyData.ratings.length === 0 ? (
                  <div className="text-center py-8 text-dark">
                    <i className="fas fa-comment-slash text-4xl text-mustard mb-3"></i>
                    <p>No reviews yet. Be the first to review this pharmacy!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pharmacyData.ratings.map((rating) => (
                      <div key={rating.id} className="border-b border-mustard/20 pb-6 last:border-0">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProductDetail}
          >
            <motion.div 
              className="bg-cream rounded-2xl overflow-hidden w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56 bg-mustard flex items-center justify-center text-cream text-3xl">
                <i className="fas fa-pills"></i>
                <button 
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream text-dark flex items-center justify-center"
                  onClick={closeProductDetail}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-olive-2 mb-2">{selectedProduct.name}</h3>
                <p className="text-dark mb-4">A quality pharmaceutical product from {pharmacyData.name}.</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xl font-bold text-mustard">{selectedProduct.price}</div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="text-dark">4.7 (85 reviews)</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-dark mb-2">Description</h4>
                  <p className="text-dark">This product is medically approved and recommended for general wellness. Always consult with a healthcare professional before use.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart({
                        ...selectedProduct,
                        price: parsePriceToNumber(selectedProduct.price),
                        pharmacyId: pharmacyData.id,
                        pharmacyName: pharmacyData.name,
                        quantity: 1,
                      } as any);
                      closeProductDetail();
                    }}
                    className="py-3 bg-white text-dark rounded-lg font-semibold hover:bg-mustard hover:text-cream transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-cart-plus"></i>
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => {
                      handleOrderNow(selectedProduct);
                      closeProductDetail();
                    }}
                    className="py-3 bg-mustard text-cream rounded-lg font-semibold hover:bg-olive-2 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    Buy Now
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
                  <h3 className="text-2xl font-bold text-olive-2">Rate {pharmacyData.name}</h3>
                  <button 
                    className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center"
                    onClick={() => setShowRatingModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
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
                    placeholder="Share your experience with this pharmacy..."
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PharmacyProfilePage;