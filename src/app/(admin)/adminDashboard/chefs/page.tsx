"use client";

import { useEffect, useMemo, useState } from "react";

type Chef = {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  category?: string;
  approved: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function ChefsPage() {
  const [pending, setPending] = useState<Chef[]>([]);
  const [accounts, setAccounts] = useState<Chef[]>([]);
  const [tab, setTab] = useState<"approved" | "pending">("approved");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data from your API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [pendingRes, accountsRes] = await Promise.all([
          fetch("/api/partners/pending"),
          fetch("/api/partners/accounts")
        ]);

        if (!pendingRes.ok) {
          throw new Error(`Failed to fetch pending: ${pendingRes.status}`);
        }
        if (!accountsRes.ok) {
          throw new Error(`Failed to fetch accounts: ${accountsRes.status}`);
        }

        const pendingData = await pendingRes.json();
        const accountsData = await accountsRes.json();

        setPending(pendingData);
        setAccounts(accountsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load chef data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function approveFromPending(_id: string) {
    try {
      const res = await fetch("/api/partners/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id })
      });

      if (res.ok) {
        // Refresh data
        const [pendingRes, accountsRes] = await Promise.all([
          fetch("/api/partners/pending"),
          fetch("/api/partners/accounts")
        ]);
        
        if (pendingRes.ok) setPending(await pendingRes.json());
        if (accountsRes.ok) setAccounts(await accountsRes.json());
        
        alert("Chef approved successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to approve chef");
      }
    } catch (error) {
      alert("Failed to approve chef");
    }
  }

  async function unapprove(_id: string) {
    try {
      const res = await fetch("/api/partners/unapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id })
      });

      if (res.ok) {
        const accountsRes = await fetch("/api/partners/accounts");
        if (accountsRes.ok) setAccounts(await accountsRes.json());
        alert("Chef unapproved successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to unapprove chef");
      }
    } catch (error) {
      alert("Failed to unapprove chef");
    }
  }

  async function removeAccount(_id: string) {
    if (!confirm("Remove chef account?")) return;
    
    try {
      const res = await fetch("/api/partners/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id })
      });

      if (res.ok) {
        const accountsRes = await fetch("/api/partners/accounts");
        if (accountsRes.ok) setAccounts(await accountsRes.json());
        alert("Chef removed successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to remove chef");
      }
    } catch (error) {
      alert("Failed to remove chef");
    }
  }

  async function rejectApplication(_id: string) {
    if (!confirm("Reject this application? This will permanently delete it.")) return;
    
    try {
      const res = await fetch("/api/partners/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id })
      });

      if (res.ok) {
        const pendingRes = await fetch("/api/partners/pending");
        if (pendingRes.ok) setPending(await pendingRes.json());
        alert("Application rejected successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to reject application");
      }
    } catch (error) {
      alert("Failed to reject application");
    }
  }

  const filteredApproved = useMemo(
    () =>
      accounts
        .filter(a => a.approved)
        .filter(a =>
          q
            ? a.businessName.toLowerCase().includes(q.toLowerCase()) ||
              a.email.toLowerCase().includes(q.toLowerCase())
            : true
        ),
    [accounts, q]
  );

  const filteredPending = useMemo(
    () =>
      pending.filter(p =>
        q
          ? p.businessName.toLowerCase().includes(q.toLowerCase()) ||
            p.email.toLowerCase().includes(q.toLowerCase())
          : true
      ),
    [pending, q]
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chef data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Chefs Management</h1>
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
              <p className="text-sm text-gray-500 font-medium">Total Chefs</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{accounts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved Chefs</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{accounts.filter(a => a.approved).length}</p>
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
              <p className="text-3xl font-bold text-gray-800 mt-1">{pending.length}</p>
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
          Approved Chefs
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

      {tab === "approved" ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApproved.length ? (
                  filteredApproved.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{a.businessName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{a.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button 
                          onClick={() => unapprove(a._id)} 
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Unapprove
                        </button>
                        <button 
                          onClick={() => removeAccount(a._id)} 
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No approved chefs found</p>
                        <p className="text-sm">Approved chefs will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPending.length ? (
                  filteredPending.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.businessName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.ownerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button 
                          onClick={() => approveFromPending(p._id)} 
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => rejectApplication(p._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No pending requests</p>
                        <p className="text-sm">Pending chef requests will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}