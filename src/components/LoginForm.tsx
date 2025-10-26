// components/LoginForm.tsx
'use client';

import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just log values (you can later connect to real backend)
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full">
      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded bg-white text-dark"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded bg-white text-dark"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-dark text-cream py-2 rounded hover:bg-green transition"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;