'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TopVendorRegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName || !email || !password) return alert('Business name, email, and password are required');
    if (password !== confirm) return alert('Passwords do not match');

    // Create or update vendor account
    const accounts = JSON.parse(localStorage.getItem('vendorAccounts') || '[]');
    const exists = accounts.find((a: any) => a.email === email);
    const id = exists?.id || `v_${Date.now()}`;

    const updatedAccounts = exists
      ? accounts.map((a: any) =>
          a.email === email
            ? { ...a, businessName, password, approved: a.approved ?? false, isTop: a.isTop ?? false, commissionRate: a.commissionRate ?? 0.07 }
            : a
        )
      : [
          ...accounts,
          {
            id,
            email,
            businessName,
            password,          // store demo password
            approved: false,   // admin must approve
            isTop: false,      // admin must mark top
            commissionRate: 0.07
          },
        ];

    localStorage.setItem('vendorAccounts', JSON.stringify(updatedAccounts));

    // Add Top Vendor application for admin
    const pending = JSON.parse(localStorage.getItem('pendingTopVendorApplications') || '[]');
    const application = { id, email, businessName, contact, requestedAt: Date.now() };
    localStorage.setItem('pendingTopVendorApplications', JSON.stringify([application, ...pending]));

    alert('Submitted! Wait for admin approval to become Top Vendor.');
    router.push('/topVendor/login');
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Apply as Top Vendor</h1>
        <p className="text-sm text-gray-600 mb-6">Premium placement & 5% commission after approval.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Business Name</label>
            <input className="w-full border rounded px-3 py-2" value={businessName} onChange={(e)=>setBusinessName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Contact (optional)</label>
            <input className="w-full border rounded px-3 py-2" value={contact} onChange={(e)=>setContact(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
          </div>

          <button className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition">Submit Application</button>
        </form>
      </div>
    </section>
  );
}