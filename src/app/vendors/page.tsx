// app/vendors/page.tsx
'use client';

import React from 'react';
import VendorCard from '@/components/VendorCard';
import { topVendors } from '@/utils/data';

const VendorsPage = () => {
  return (
    <section className="py-12 px-6 bg-cream text-dark min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">All Verified Food Vendors</h1>
        <p className="text-lg mb-8">Discover trusted vendors offering your favorite meals around FUTO.</p>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {topVendors.map((vendor) => (
            <VendorCard key={vendor.id} {...vendor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendorsPage;