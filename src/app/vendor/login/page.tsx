'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If already “logged in”, bounce to dashboard
  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem('vendorAuth') : null;
    if (auth) router.replace('/vendorDashboard');
  }, [router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    // super-simple demo check — replace with real auth later
    if (!email || !password) {
      alert('Enter email and password');
      return;
    }

    // store a fake session (attach a vendorId you’ll use later)
    localStorage.setItem(
      'vendorAuth',
      JSON.stringify({ vendorId: 'v1', email })
    );

    router.push('/vendorDashboard');
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Vendor Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in to manage your orders, menu, and earnings.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </section>
  );
}