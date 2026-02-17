"use client";

import { useEffect, useMemo, useState } from "react";

type Vendor = {
  _id: string;
  name: string;
  businessName: string;
  ownerName: string;
  email: string;
  category: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tab, setTab] = useState<"approved" | "pending">("approved");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all vendors from your existing endpoint
  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/vendors");
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
        } else {
          console.error("Failed to load vendors");
        }
      } catch (err) {
        console.error("Failed to load vendors", err);
      } finally {
        setLoading(false);
      }
    }

    loadVendors();
  }, []);

  async function approveFromPending(id: string) {
    try {
      const res = await fetch(`/api/admin/vendors/${id}/approve`, {
        method: "PATCH",
      });

      if (res.ok) {
        // Update local state
        setVendors(prev => prev.map(v => 
          v._id === id ? { ...v, approved: true } : v
        ));
        alert("Vendor approved successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to approve vendor");
      }
    } catch (error) {
      alert("Failed to approve vendor");
    }
  }

  async function unapprove(id: string) {
    try {
      const res = await fetch(`/api/admin/vendors/${id}/unapprove`, {
        method: "PATCH",
      });

      if (res.ok) {
        // Update local state
        setVendors(prev => prev.map(v => 
          v._id === id ? { ...v, approved: false } : v
        ));
        alert("Vendor unapproved successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to unapprove vendor");
      }
    } catch (error) {
      alert("Failed to unapprove vendor");
    }
  }

  async function removeAccount(id: string) {
    if (!confirm("Remove vendor account?")) return;
    
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from local state
        setVendors(prev => prev.filter(v => v._id !== id));
        alert("Vendor removed successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to remove vendor");
      }
    } catch (error) {
      alert("Failed to remove vendor");
    }
  }

  async function rejectApplication(id: string) {
    if (!confirm("Reject this application? This will permanently delete it.")) return;
    
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from local state
        setVendors(prev => prev.filter(v => v._id !== id));
        alert("Application rejected successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to reject application");
      }
    } catch (error) {
      alert("Failed to reject application");
    }
  }

  // Filter vendors based on tab and search query
  const filteredVendors = useMemo(() => {
    const filtered = vendors.filter(v =>
      q
        ? v.businessName?.toLowerCase().includes(q.toLowerCase()) ||
          v.name?.toLowerCase().includes(q.toLowerCase()) ||
          v.email.toLowerCase().includes(q.toLowerCase())
        : true
    );

    if (tab === "approved") {
      return filtered.filter(v => v.approved);
    } else {
      return filtered.filter(v => !v.approved);
    }
  }, [vendors, q, tab]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Vendor Management</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search business or email"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{vendors.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved Vendors</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{vendors.filter(v => v.approved).length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{vendors.filter(v => !v.approved).length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex bg-white rounded-lg p-1 shadow-sm w-fit">
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "approved" 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved Vendors
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "pending" 
              ? "bg-indigo-100 text-indigo-700" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending Approval
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.length ? (
                filteredVendors.map(v => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{v.businessName || v.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{v.ownerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{v.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{v.category || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        v.approved 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {v.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {v.approved ? (
                        <>
                          <button 
                            onClick={() => unapprove(v._id)} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Unapprove
                          </button>
                          <button 
                            onClick={() => removeAccount(v._id)} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => approveFromPending(v._id)} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => rejectApplication(v._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-lg font-medium">
                        {tab === "approved" ? "No approved vendors found" : "No pending requests"}
                      </p>
                      <p className="text-sm">
                        {tab === "approved" ? "Approved vendors will appear here" : "Pending vendor requests will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}