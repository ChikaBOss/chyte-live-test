'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VendorRegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Food');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName || !ownerName || !email) {
      alert('Please complete required fields'); 
      return;
    }

    const id = `v_${Date.now()}`;
    const accounts = JSON.parse(localStorage.getItem('vendorAccounts') || '[]');
    if (accounts.some((a: any) => a.email === email)) {
      alert('Account already exists with that email'); 
      return;
    }

    const newAccount = { id, email, approved: false, businessName };
    localStorage.setItem('vendorAccounts', JSON.stringify([...accounts, newAccount]));

    const pending = JSON.parse(localStorage.getItem('pendingVendors') || '[]');
    const pendingRecord = {
      id, businessName, ownerName, email, phone, address, category, createdAt: Date.now(),
    };
    localStorage.setItem('pendingVendors', JSON.stringify([pendingRecord, ...pending]));

    alert('Submitted! Wait for admin approval.');
    router.push('/vendor/login');
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Register your Vendor Account</h1>
          <p className="text-sm text-gray-600 mt-2">
            Submit your details. Admin will review and approve your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Business Name *</label>
              <input
                className="w-full border border-dark/20 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
                placeholder="e.g. Sonic Foods"
                value={businessName}
                onChange={e=>setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Owner Name *</label>
              <input
                className="w-full border border-dark/20 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
                placeholder="e.g. Emeka Obi"
                value={ownerName}
                onChange={e=>setOwnerName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Email *</label>
              <input
                type="email"
                className="w-full border border-dark/20 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
                placeholder="vendor@example.com"
                value={email}
                onChange={e=>setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input
                className="w-full border border-dark/20 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
                placeholder="+234..."
                value={phone}
                onChange={e=>setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Address</label>
            <input
              className="w-full border border-dark/20 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green"
              placeholder="e.g. FUTO South Gate, Eziobodo"
              value={address}
              onChange={e=>setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="w-full border border-dark/20 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green bg-white"
              value={category}
              onChange={e=>setCategory(e.target.value)}
            >
              <option>Food</option>
              <option>Chef</option>
              <option>Pharmacy</option>
            </select>
          </div>

          <button
            className="w-full bg-dark text-cream px-4 py-3 rounded hover:bg-green transition font-medium"
          >
            Submit for Approval
          </button>
        </form>
      </div>
    </section>
  );
}