// app/chefs/page.tsx

'use client';

import React from 'react';
import ChefCard from '../../components/ChefCard';
import { chefs } from '../../utils/data';

export default function ChefsPage() {
  return (
    <main className="py-12 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8 text-center">Approved Chefs</h1>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {chefs.map((chef) => (
            <ChefCard key={chef.id} {...chef} />
          ))}
        </div>
      </div>
    </main>
  );
}