'use client';

import { useEffect, useMemo, useState } from 'react';

type Rider = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  approved: boolean;
  status?: string;
  isActive: boolean;                // new field
  documents?: { name: string; type: string; url: string }[];
  createdAt: string;
};

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [q, setQ] = useState('');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  // Fetch riders
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/riders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch riders');
        setRiders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  // Approve rider
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/riders/${id}/approve`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Approval failed');
      setRiders(prev => prev.map(r => r._id === id ? { ...r, approved: true } : r));
      alert('Rider approved');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Unapprove (move back to pending)
  const handleUnapprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/riders/${id}/unapprove`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Unapprove failed');
      setRiders(prev => prev.map(r => r._id === id ? { ...r, approved: false } : r));
      alert('Rider unapproved');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, newStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/riders/${id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (!res.ok) throw new Error('Failed to toggle');
      const data = await res.json();
      setRiders(prev => prev.map(r => r._id === id ? { ...r, isActive: data.isActive } : r));
      alert(`Rider ${data.isActive ? 'activated' : 'suspended'}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reject (delete) rider
  const handleReject = async (id: string) => {
    if (!confirm('Delete this rider permanently?')) return;
    try {
      const res = await fetch(`/api/admin/riders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      setRiders(prev => prev.filter(r => r._id !== id));
      alert('Rider removed');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter and search
  const filtered = useMemo(() => {
    return riders
      .filter(r => (tab === 'pending' ? !r.approved : r.approved))
      .filter(r => {
        if (!q) return true;
        const search = q.toLowerCase();
        return (
          r.name.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          (r.phone && r.phone.includes(search))
        );
      });
  }, [riders, tab, q]);

  // Stats
  const totalPending = riders.filter(r => !r.approved).length;
  const totalApproved = riders.filter(r => r.approved).length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rider Management</h1>
        <div className="relative mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-4 pr-4 py-2 border rounded-lg w-full md:w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Riders</p>
          <p className="text-2xl font-bold">{riders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold">{totalApproved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{totalPending}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex bg-white rounded-lg p-1 shadow-sm w-fit">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === 'pending' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
          }`}
        >
          Pending ({totalPending})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === 'approved' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
          }`}
        >
          Approved ({totalApproved})
        </button>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Docs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map(rider => (
                  <tr key={rider._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rider.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{rider.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{rider.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {rider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rider.documents && rider.documents.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedRider(rider);
                            setShowDocs(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View ({rider.documents.length})
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {tab === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(rider._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(rider._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUnapprove(rider._id)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-md text-xs"
                          >
                            Unapprove
                          </button>
                          <button
                            onClick={() => handleToggleActive(rider._id, !rider.isActive)}
                            className={`px-3 py-1 rounded-md text-xs ${
                              rider.isActive 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-green-500 text-white'
                            }`}
                          >
                            {rider.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleReject(rider._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No {tab} riders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Modal (same as before) */}
      {showDocs && selectedRider && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Documents: {selectedRider.name}</h3>
              <button onClick={() => setShowDocs(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {selectedRider.documents?.map((doc, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">{doc.name}</p>
                  {doc.type.startsWith('image') ? (
                    <img src={doc.url} alt={doc.name} className="max-h-96 mx-auto rounded border" />
                  ) : (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      Open Document
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button onClick={() => setShowDocs(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}