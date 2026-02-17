// components/SessionDebug.jsx
'use client';

import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();

  return (
    <div className="fixed top-4 right-4 bg-blue-100 p-4 rounded-lg shadow">
      <h3 className="font-bold">🔐 Session Debug</h3>
      <p>Status: {status}</p>
      {session && (
        <div className="text-sm">
          <p>User ID: {session.user?.id}</p>
          <p>Role: {session.user?.role}</p>
          <p>Email: {session.user?.email}</p>
        </div>
      )}
    </div>
  );
}