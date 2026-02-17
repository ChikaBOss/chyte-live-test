'use client';

import React, { useEffect, useState } from 'react';
import ChefCard from '@/components/ChefCard';

interface ApiChef {
  _id: string;
  businessName: string;
  ownerName: string;
  displayName?: string;
  avatarUrl?: string;
  category?: string;
  specialties?: string;
  experience?: string;
  // UPDATED: Replace address with pickup fields
  pickupZone?: string;
  pickupAddress?: string;
  pickupPhone?: string;
  approved?: boolean;
  rating?: number;
  minOrder?: number;
  available?: boolean;
}

export default function ChefsPage() {
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChefs() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/chefs');
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `${res.status} ${res.statusText}`);
        }

        const chefsData: ApiChef[] = await res.json();

        // Map to the exact props ChefCard expects. Be explicit with defaults.
        const mapped = chefsData
          .filter(c => c.approved !== false) // show approved by default (adjust if needed)
          .map(c => ({
            id: c._id,
            name: c.displayName || c.businessName || 'Unknown Chef',
            image: c.avatarUrl || '/images/chef-placeholder.jpg',
            specialty: c.specialties || c.category || 'Culinary Expert',
            experience: c.experience || 'Professional Chef',
            rating: typeof c.rating === 'number' ? c.rating : 0,
            // UPDATED: Use pickupZone for location (not address)
            location: c.pickupZone || 'Pickup location not specified',
            minOrder: c.minOrder,
            available: c.available ?? true,
            raw: c, // keep original if needed
          }));

        setChefs(mapped);
      } catch (err: any) {
        console.error('Error fetching chefs', err);
        setError(err.message || 'Failed to load chefs');
      } finally {
        setLoading(false);
      }
    }

    fetchChefs();
  }, []);

  if (loading) {
    return (
      <main className="py-12 px-6 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-dark mb-8">Approved Chefs</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard mx-auto" />
          <p className="text-center text-dark mt-4">Loading chefs...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-12 px-6 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-dark mb-8">Approved Chefs</h1>
          <div className="text-red-600">{error}</div>
          <div className="mt-4">
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-mustard text-cream rounded-full">Try Again</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8 text-center">Approved Chefs ({chefs.length})</h1>

        {chefs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold text-dark mb-2">No Chefs Available</h2>
            <p className="text-dark mb-6">There are currently no approved chefs in your area.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-mustard text-cream rounded-full">Check Again</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {chefs.map((chef) => (
              <ChefCard
                key={chef.id}
                id={chef.id}
                name={chef.name}
                image={chef.image}
                specialty={chef.specialty}
                experience={chef.experience}
                rating={chef.rating}
                location={chef.location}
                minOrder={chef.minOrder}
                available={chef.available}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}