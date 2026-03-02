"use client";

import { useEffect, useMemo, useState } from "react";

type Application = {
  _id: string;
  role: "chef" | "vendor" | "pharmacy" | "topvendor";
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  documents?: { name: string; type: string; url: string }[];
  approved: boolean;
  createdAt: string;
};

export default function ApprovalsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  // Fetch all applications (pending and approved) from existing endpoints
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from all role-specific endpoints in parallel
        const [
          chefsRes,
          vendorsRes,
          pharmaciesRes,
          topVendorsRes
        ] = await Promise.allSettled([
          fetch("/api/partners/accounts"),        // chefs (both pending & approved)
          fetch("/api/admin/vendors"),             // vendors (all)
          fetch("/api/admin/pharmacies"),          // pharmacies (all)
          fetch("/api/top-vendors/accounts")       // top vendors (all)
        ]);

        const allApps: Application[] = [];

        // Process chefs
        if (chefsRes.status === "fulfilled" && chefsRes.value.ok) {
          const chefs = await chefsRes.value.json();
          chefs.forEach((c: any) => {
            allApps.push({
              _id: c._id,
              role: "chef",
              businessName: c.businessName,
              ownerName: c.ownerName,
              email: c.email,
              phone: c.phone,
              address: c.address,
              approved: c.approved,
              createdAt: c.createdAt,
            });
          });
        }

        // Process vendors
        if (vendorsRes.status === "fulfilled" && vendorsRes.value.ok) {
          const vendors = await vendorsRes.value.json();
          vendors.forEach((v: any) => {
            allApps.push({
              _id: v._id,
              role: "vendor",
              businessName: v.businessName || v.name,
              ownerName: v.ownerName,
              email: v.email,
              phone: v.phone,
              address: v.address,
              documents: v.documents,
              approved: v.approved,
              createdAt: v.createdAt,
            });
          });
        }

        // Process pharmacies
        if (pharmaciesRes.status === "fulfilled" && pharmaciesRes.value.ok) {
          const pharmacies = await pharmaciesRes.value.json();
          pharmacies.forEach((p: any) => {
            allApps.push({
              _id: p._id,
              role: "pharmacy",
              businessName: p.pharmacyName,
              ownerName: p.ownerName,
              email: p.email,
              phone: p.phone,
              address: p.address,
              documents: p.documents,
              approved: p.approved,
              createdAt: p.createdAt,
            });
          });
        }

        // Process top vendors
        if (topVendorsRes.status === "fulfilled" && topVendorsRes.value.ok) {
          const topVendors = await topVendorsRes.value.json();
          topVendors.forEach((tv: any) => {
            allApps.push({
              _id: tv._id,
              role: "topvendor",
              businessName: tv.businessName,
              ownerName: tv.ownerName,
              email: tv.email,
              phone: tv.phone,
              address: tv.address,
              approved: tv.approved,
              createdAt: tv.createdAt,
            });
          });
        }

        setApplications(allApps);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Approve application
  const handleApprove = async (app: Application) => {
    if (!confirm(`Approve ${app.businessName}?`)) return;

    try {
      const endpoint = 
        app.role === "chef" ? `/api/partners/approve` :
        app.role === "vendor" ? `/api/admin/vendors/${app._id}/approve` :
        app.role === "pharmacy" ? `/api/admin/pharmacies/${app._id}/approve` :
        `/api/top-vendors/approve`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app._id }),
      });

      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a._id === app._id ? { ...a, approved: true } : a)
        );
        alert("Approved successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Approval failed");
      }
    } catch (error) {
      alert("Approval failed");
    }
  };

  // Unapprove (move back to pending) – only for approved tab
  const handleUnapprove = async (app: Application) => {
    if (!confirm(`Unapprove ${app.businessName}?`)) return;

    try {
      const endpoint =
        app.role === "chef" ? `/api/partners/unapprove` :
        app.role === "vendor" ? `/api/admin/vendors/${app._id}/unapprove` :
        app.role === "pharmacy" ? `/api/admin/pharmacies/${app._id}/unapprove` :
        `/api/top-vendors/unapprove`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app._id }),
      });

      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a._id === app._id ? { ...a, approved: false } : a)
        );
        alert("Unapproved successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Unapprove failed");
      }
    } catch (error) {
      alert("Unapprove failed");
    }
  };

  // Reject/delete application
  const handleReject = async (app: Application) => {
    if (!confirm(`Reject ${app.businessName}? This will permanently delete the application.`)) return;

    try {
      const endpoint =
        app.role === "chef" ? `/api/partners/remove` :
        app.role === "vendor" ? `/api/admin/vendors/${app._id}` :
        app.role === "pharmacy" ? `/api/admin/pharmacies/${app._id}` :
        `/api/top-vendors/remove`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app._id }),
      });

      if (res.ok) {
        setApplications(prev => prev.filter(a => a._id !== app._id));
        alert("Application removed.");
      } else {
        const err = await res.json();
        alert(err.error || "Rejection failed");
      }
    } catch (error) {
      alert("Rejection failed");
    }
  };

  // Filter applications based on tab, search, and role
  const filtered = useMemo(() => {
    return applications
      .filter(app => tab === "pending" ? !app.approved : app.approved)
      .filter(app => {
        if (roleFilter !== "all" && app.role !== roleFilter) return false;
        if (!q) return true;
        const search = q.toLowerCase();
        return (
          app.businessName.toLowerCase().includes(search) ||
          app.ownerName.toLowerCase().includes(search) ||
          app.email.toLowerCase().includes(search)
        );
      });
  }, [applications, tab, q, roleFilter]);

  // Stats
  const totalPending = applications.filter(a => !a.approved).length;
  const totalApproved = applications.filter(a => a.approved).length;
  const pendingByRole = useMemo(() => {
    return applications
      .filter(a => !a.approved)
      .reduce((acc, app) => {
        acc[app.role] = (acc[app.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  }, [applications]);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-gray-50 min-h-screen">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Approvals Dashboard</h1>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search business, owner, email..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-80"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 font-medium">Total Pending</p>
          <p className="text-2xl font-bold text-gray-800">{totalPending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Chefs Pending</p>
          <p className="text-2xl font-bold text-blue-600">{pendingByRole.chef || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Vendors Pending</p>
          <p className="text-2xl font-bold text-green-600">{pendingByRole.vendor || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">Pharmacies Pending</p>
          <p className="text-2xl font-bold text-purple-600">{pendingByRole.pharmacy || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Top Vendors Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingByRole.topvendor || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-gray-500">
          <p className="text-sm text-gray-500 font-medium">Total Approved</p>
          <p className="text-2xl font-bold text-gray-800">{totalApproved}</p>
        </div>
      </div>

      {/* Tabs: Pending / Approved */}
      <div className="mb-6 flex bg-white rounded-lg p-1 shadow-sm w-fit">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "pending" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending ({totalPending})
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "approved" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved ({totalApproved})
        </button>
      </div>

      {/* Role Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "chef", "vendor", "pharmacy", "topvendor"].map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              roleFilter === role
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{app.ownerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{app.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full 
                        ${app.role === 'chef' ? 'bg-blue-100 text-blue-800' : ''}
                        ${app.role === 'vendor' ? 'bg-green-100 text-green-800' : ''}
                        ${app.role === 'pharmacy' ? 'bg-purple-100 text-purple-800' : ''}
                        ${app.role === 'topvendor' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {app.role.charAt(0).toUpperCase() + app.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.documents && app.documents.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowDocs(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View ({app.documents.length})
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {tab === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(app)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUnapprove(app)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Unapprove
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No {tab} applications found</p>
                      <p className="text-sm">Adjust filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Modal (same as before) */}
      {showDocs && selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Documents: {selectedApp.businessName}</h3>
              <button onClick={() => setShowDocs(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {selectedApp.documents?.map((doc, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium mb-2">{doc.name}</p>
                  {doc.type.startsWith("image") ? (
                    <img src={doc.url} alt={doc.name} className="max-h-96 mx-auto rounded border" />
                  ) : (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Open Document
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowDocs(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}