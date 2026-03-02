'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RiderSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/rider/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      router.push('/rider/login?message=Account created. Await admin approval.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-6 bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Register as a Rider</h1>
          <p className="text-sm text-gray-600 mt-2">
            Riders are reviewed manually before approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green focus:border-transparent"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email *
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green focus:border-transparent"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Phone & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone *
              </label>
              <input
                type="tel"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green focus:border-transparent"
                placeholder="+234 800 000 0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password *
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green focus:border-transparent"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
          </div>

          {/* Address (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Address (optional)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green focus:border-transparent"
              placeholder="Your base location / address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Optional: Profile picture upload (placeholder) */}
          {/* You can add a file upload input here if needed */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-cream py-3 rounded-lg font-semibold hover:bg-green transition disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit for Approval'}
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{' '}
            <Link href="/rider/login" className="text-green hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}