'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

type VendorAccount = {
  id: string;
  email: string;
  businessName?: string;
  approved?: boolean;
  isTop?: boolean;
  commissionRate?: number;
  topExpiresAt?: number;
  password?: string; // saved at registration (demo only)
};

export default function TopVendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('topVendorAuth');
    if (auth) router.replace('/topVendorDashboard');
  }, [router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const list: VendorAccount[] = JSON.parse(localStorage.getItem('vendorAccounts') || '[]');
    const acc = list.find((a) => a.email === email);

    if (!acc) return alert('Account not found.');
    if (!acc.approved) return alert('Account not approved yet.');
    if (!acc.isTop) return alert('This account is not Top Verified.');

    if (!acc.password || acc.password !== password) {
      return alert('Invalid password.');
    }

    if (acc.topExpiresAt && acc.topExpiresAt < Date.now()) {
      const updated = list.map((a) =>
        a.id === acc.id ? { ...a, isTop: false, commissionRate: 0.07, topExpiresAt: undefined } : a
      );
      localStorage.setItem('vendorAccounts', JSON.stringify(updated));
      return alert('Top status expired. Contact admin to renew.');
    }

    localStorage.setItem('topVendorAuth', JSON.stringify({ vendorId: acc.id, email: acc.email }));
    router.push('/topVendorDashboard');
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Top Vendor Login</h1>
        <p className="text-sm text-gray-600 mb-6">Sign in to your premium dashboard.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition">
            Sign In
          </button>
        </form>
      </div>
    </section>
  );
}