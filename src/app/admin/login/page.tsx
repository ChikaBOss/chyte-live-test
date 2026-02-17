'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    localStorage.setItem(
      'adminAuth',
      JSON.stringify({ role: 'admin', email })
    );

    router.replace('/adminDashboard');
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-cream">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-96">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <input className="border p-2 w-full mb-3" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border p-2 w-full mb-3" placeholder="Password"
          type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-black text-white w-full py-2">Login</button>
      </form>
    </section>
  );
}