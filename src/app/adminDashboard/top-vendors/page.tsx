'use client';

import { useEffect, useMemo, useState } from 'react';

type PendingApp = {
  id: string;
  email: string;
  businessName: string;
  contact?: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  category?: string;
  requestedAt?: number;
  createdAt?: number;
};

type VendorAccount = {
  id: string;
  email: string;
  businessName?: string;
  password?: string;
  approved?: boolean;
  isTop?: boolean;
  commissionRate?: number;
  topExpiresAt?: number;
};

const TOP_DAYS_DEFAULT = 30;
const MS_DAY = 24 * 60 * 60 * 1000;

export default function AdminTopVendorsPage() {
  const [accounts, setAccounts] = useState<VendorAccount[]>([]);
  const [pending, setPending] = useState<PendingApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'regular'>('pending');

  const readJSON = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJSON = (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  function loadAll() {
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    const p1 = readJSON<PendingApp[]>('pendingTopVendorApplications', []);
    const p2 = readJSON<PendingApp[]>('pendingTopVendors', []);

    const mergedMap = new Map<string, PendingApp>();
    [...p1, ...p2].forEach((p) => {
      const key = p.id || p.email;
      if (key && !mergedMap.has(key)) mergedMap.set(key, p);
    });

    setAccounts(accs);
    setPending(Array.from(mergedMap.values()));
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function refresh() {
    loadAll();
  }

  function approvePending(p: PendingApp) {
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    const idx = accs.findIndex((a) => a.id === p.id || a.email === p.email);

    const now = Date.now();
    const topExpiresAt = now + TOP_DAYS_DEFAULT * MS_DAY;

    if (idx >= 0) {
      accs[idx] = {
        ...accs[idx],
        businessName: p.businessName || accs[idx].businessName,
        approved: true,
        isTop: true,
        commissionRate: 0.05,
        topExpiresAt,
      };
    } else {
      accs.push({
        id: p.id || `v_${Date.now()}`,
        email: p.email,
        businessName: p.businessName,
        password: 'changeme123',
        approved: true,
        isTop: true,
        commissionRate: 0.05,
        topExpiresAt,
      });
    }

    const pApps = readJSON<PendingApp[]>('pendingTopVendorApplications', []);
    const pOld = readJSON<PendingApp[]>('pendingTopVendors', []);
    const byKey = (x: PendingApp) => (x.id || x.email) !== (p.id || p.email);

    writeJSON('vendorAccounts', accs);
    writeJSON('pendingTopVendorApplications', pApps.filter(byKey));
    writeJSON('pendingTopVendors', pOld.filter(byKey));

    alert(`Approved ${p.businessName || p.email} as Top Vendor (5% commission).`);
    refresh();
  }

  function rejectPending(p: PendingApp) {
    const pApps = readJSON<PendingApp[]>('pendingTopVendorApplications', []);
    const pOld = readJSON<PendingApp[]>('pendingTopVendors', []);
    const byKey = (x: PendingApp) => (x.id || x.email) !== (p.id || p.email);

    writeJSON('pendingTopVendorApplications', pApps.filter(byKey));
    writeJSON('pendingTopVendors', pOld.filter(byKey));
    refresh();
  }

  function revokeTop(id: string) {
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    const idx = accs.findIndex((a) => a.id === id);
    if (idx < 0) return;

    accs[idx] = {
      ...accs[idx],
      isTop: false,
      commissionRate: 0.07,
      topExpiresAt: undefined,
    };

    writeJSON('vendorAccounts', accs);
    refresh();
  }

  function extendTop(id: string, days = 30) {
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    const idx = accs.findIndex((a) => a.id === id);
    if (idx < 0) return;

    const current =
      accs[idx].topExpiresAt && accs[idx].topExpiresAt! > Date.now()
        ? accs[idx].topExpiresAt!
        : Date.now();

    accs[idx] = {
      ...accs[idx],
      isTop: true,
      commissionRate: 0.05,
      topExpiresAt: current + days * MS_DAY,
    };

    writeJSON('vendorAccounts', accs);
    refresh();
  }

  function setCommission(id: string, rate: number) {
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    const idx = accs.findIndex((a) => a.id === id);
    if (idx < 0) return;

    accs[idx] = {
      ...accs[idx],
      commissionRate: rate,
    };

    writeJSON('vendorAccounts', accs);
    refresh();
  }

  function resetPassword(id: string) {
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    const idx = accs.findIndex((a) => a.id === id);
    if (idx < 0) return;

    const newPass = 'changeme123';
    accs[idx] = { ...accs[idx], password: newPass };
    writeJSON('vendorAccounts', accs);
    alert(`Temp password set to: ${newPass}`);
    refresh();
  }

  function deleteAccount(id: string) {
    if (!confirm('Delete this Top Vendor account? This cannot be undone.')) return;
    const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
    writeJSON('vendorAccounts', accs.filter((a) => a.id !== id));
    refresh();
  }

  const topVendors = useMemo(() => accounts.filter((a) => a.isTop), [accounts]);
  const registeredNotTop = useMemo(
    () => accounts.filter((a) => a.approved && !a.isTop),
    [accounts]
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Reusable icons (valid paths)
  const IconClock = ({ className = 'h-6 w-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
    </svg>
  );
  const IconCheckCircle = ({ className = 'h-6 w-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
    </svg>
  );
  const IconUsers = ({ className = 'h-6 w-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* simplified group/users icon */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0" />
    </svg>
  );
  const IconCheck = ({ className = 'w-4 h-4 mr-1' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
  const IconX = ({ className = 'w-4 h-4 mr-1' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Top Vendors Management</h1>
            <p className="text-gray-600 mt-1">
              Approve premium vendors, manage commission rates, and access.
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <div className="bg-white rounded-lg p-1 shadow-sm flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Top Vendors
              </button>
              <button
                onClick={() => setActiveTab('regular')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'regular'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Regular Vendors
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Applications</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pending.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <IconClock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Top Vendors</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{topVendors.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IconCheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Regular Vendors</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{registeredNotTop.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <IconUsers className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Applications */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Pending Applications</h2>
            </div>
            <div className="p-6">
              {pending.length === 0 ? (
                <div className="text-center py-8">
                  <IconClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500">No pending applications</p>
                  <p className="text-sm text-gray-400 mt-1">
                    New top vendor applications will appear here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pending.map((p) => (
                        <tr key={p.id || p.email} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {p.businessName || '(no business name)'}
                            </div>
                            <div className="text-sm text-gray-500">{p.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {p.contact || p.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(p.requestedAt || p.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => approvePending(p)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <IconCheck />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectPending(p)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <IconX />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Vendors */}
        {activeTab === 'approved' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Top Vendors</h2>
            </div>
            <div className="p-6">
              {topVendors.length === 0 ? (
                <div className="text-center py-8">
                  <IconUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500">No top vendors yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Approve vendors from the pending applications tab
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topVendors.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {a.businessName || '(unnamed)'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {a.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {((a.commissionRate ?? 0.05) * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {a.topExpiresAt ? new Date(a.topExpiresAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => extendTop(a.id, 30)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <IconClock className="w-4 h-4 mr-1" />
                                Extend
                              </button>
                              <button
                                onClick={() => resetPassword(a.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                <IconCheck className="w-4 h-4 mr-1" />
                                Reset PW
                              </button>
                              <button
                                onClick={() => revokeTop(a.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              >
                                <IconX className="w-4 h-4 mr-1" />
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regular Vendors */}
        {activeTab === 'regular' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Regular Vendors</h2>
            </div>
            <div className="p-6">
              {registeredNotTop.length === 0 ? (
                <div className="text-center py-8">
                  <IconUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500">No regular vendors</p>
                  <p className="text-sm text-gray-400 mt-1">All vendors are currently top vendors</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registeredNotTop.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {a.businessName || '(unnamed)'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {a.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                const accs = readJSON<VendorAccount[]>('vendorAccounts', []);
                                const idx = accs.findIndex((x) => x.id === a.id);
                                if (idx >= 0) {
                                  accs[idx] = {
                                    ...accs[idx],
                                    isTop: true,
                                    commissionRate: 0.05,
                                    topExpiresAt: Date.now() + TOP_DAYS_DEFAULT * MS_DAY,
                                  };
                                  writeJSON('vendorAccounts', accs);
                                  refresh();
                                }
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <IconCheck />
                              Make Top
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}