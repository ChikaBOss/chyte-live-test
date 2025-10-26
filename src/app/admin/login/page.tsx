'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminAuth');
      if (raw) { router.replace('/adminDashboard'); return; }
    } finally { setChecking(false); }
  }, [router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return alert('Enter email and password');
    localStorage.setItem('adminAuth', JSON.stringify({ role: 'admin', email }));
    router.push('/adminDashboard');
  }

  if (checking) return null; // or a small spinner

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Admin Login</h1>
        <p className="text-sm text-gray-600 mb-6">Sign in to manage approvals and vendors.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green"
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green"
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          <button type="submit" className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition">Sign In</button>
        </form>
      </div>
    </section>
  );
}