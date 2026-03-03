'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

type SearchResult = {
  id: string;
  name: string;
  price: number;
  image?: string;
  vendorId: string;
  vendorName: string;
  vendorType: 'vendor' | 'chef' | 'pharmacy' | 'topvendor';
  pickupZone?: string;
};

// Inner component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleAddToCart = (item: SearchResult) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || '/images/placeholder.jpg',
      description: '',
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      vendorBaseLocation: item.pickupZone || 'Unknown',
      vendorRole: item.vendorType,
      quantity: 1,
    });
  };

  const getVendorLink = (item: SearchResult) => {
    switch (item.vendorType) {
      case 'vendor': return `/vendors/${item.vendorId}`;
      case 'chef': return `/chefs/${item.vendorId}`;
      case 'pharmacy': return `/pharmacy/${item.vendorId}`;
      case 'topvendor': return `/topVendors/${item.vendorId}`;
      default: return '#';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-mustard border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Search results for "{query}"</h1>
      <p className="text-dark/70 mb-8">{results.length} items found</p>

      {!loading && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found. Try a different keyword.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <motion.div
            key={`${item.vendorType}-${item.id}`}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={getVendorLink(item)} className="block relative h-48 w-full">
              <Image
                src={item.image || '/images/placeholder.jpg'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </Link>
            <div className="p-4">
              <Link href={getVendorLink(item)}>
                <h3 className="font-bold text-lg text-dark hover:text-green transition-colors">
                  {item.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <span className="text-green font-bold text-xl">
                  ₦{item.price.toLocaleString()}
                </span>
                <span className="text-xs bg-cream px-2 py-1 rounded-full text-dark/70">
                  {item.vendorType}
                </span>
              </div>
              <div className="mt-2 text-sm text-dark/70">
                <p>by {item.vendorName || 'Unknown Vendor'}</p>
                <p className="flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {item.pickupZone || 'Pickup location not specified'}
                </p>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                className="mt-4 w-full bg-mustard text-cream py-2 rounded-full font-semibold hover:bg-green transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

// Main export with Suspense boundary
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-cream pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <Suspense fallback={<div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-mustard border-t-transparent rounded-full animate-spin"></div></div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}