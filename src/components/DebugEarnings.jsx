// components/DebugEarnings.jsx
'use client';

import { useEffect, useState } from 'react';

export default function DebugEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vendors/earnings?range=30d')
      .then(res => res.json())
      .then(data => {
        console.log('🔍 DEBUG - Full API Response:', data);
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading debug data...</div>;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 API Response Debug</h3>
      <div className="text-sm">
        <p><strong>Status:</strong> {data.success ? '✅ Success' : '❌ Failed'}</p>
        <p><strong>Wallet Balance:</strong> ₦{data.wallet?.balance?.toLocaleString()}</p>
        <p><strong>Orders Found:</strong> {data.orders?.length || 0}</p>
        <p><strong>Stats Gross:</strong> ₦{data.stats?.gross?.toLocaleString()}</p>
        <button 
          onClick={() => console.log('Full data:', data)}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
        >
          Log to Console
        </button>
      </div>
    </div>
  );
}