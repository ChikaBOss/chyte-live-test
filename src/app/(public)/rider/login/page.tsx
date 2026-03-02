'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RiderLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      role: 'rider',
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password, or account not approved');
      setLoading(false);
    } else {
      router.push('/riderDashboard');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-dark mb-6">Rider Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input type="email" className="border p-3 w-full mb-3 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="border p-3 w-full mb-3 rounded" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-dark text-cream py-3 rounded font-semibold hover:bg-green disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-sm text-center mt-4">
          No account? <Link href="/rider/signup" className="text-green">Sign up</Link>
        </p>
      </form>
    </div>
  );
}