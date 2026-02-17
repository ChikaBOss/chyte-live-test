'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function VendorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert('Enter email and password');
      return;
    }

    setLoading(true);

    try {
      // ✅ USE NextAuth signIn WITH ROLE PARAMETER
      const result = await signIn('credentials', {
        email,
        password,
        role: 'vendor', // 🔥 CRITICAL: Tell auth which role to check for
        redirect: false,
      });

      console.log('🔐 Vendor login result:', result);

      if (result?.error) {
        alert('Invalid credentials or account not approved');
        return;
      }

      // ✅ Redirect to vendor dashboard
      router.push('/vendorDashboard');
      router.refresh();
    } catch (err) {
      console.error('Vendor login error:', err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Vendor Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in to manage your orders, menu, and earnings.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="vendor@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <p className="font-semibold">🔍 Debug Info:</p>
            <p>Email: <code>chikafavourchisom@gmail.com</code></p>
            <p>Role being sent: <strong>vendor</strong></p>
            <p>Expected vendor ID: <code>696e5260b9657096798e4f84</code></p>
            <p>Expected balance: ₦5,000</p>
          </div>
        </form>
      </div>
    </section>
  );
}