"use client";

import { useEffect, useMemo, useState } from "react";``

type Order = {
  id: string;
  total: number;      // NGN
  status: "pending" | "paid" | "delivered" | "cancelled";
  createdAt: number;
};

const COMMISSION = 0.07; // 7%

export default function EarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem("orders") || "[]"));
  }, []);

  const now = Date.now();
  const fromTs =
    range === "7d" ? now - 7 * 86400000 :
    range === "30d" ? now - 30 * 86400000 :
    0;

  const paid = useMemo(
    () => orders.filter(o => (o.status === "paid" || o.status === "delivered") && o.createdAt >= fromTs),
    [orders, fromTs]
  );

  const gross = paid.reduce((s, o) => s + o.total, 0);
  const adminCut = Math.round(gross * COMMISSION);
  const vendorsNet = gross - adminCut;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Earnings Overview</h1>
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
          {[
            { value: "7d", label: "7D" },
            { value: "30d", label: "30D" },
            { value: "all", label: "All Time" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                range === option.value 
                  ? "bg-indigo-100 text-indigo-700" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Gross Sales</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">₦{gross.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">{paid.length} completed orders</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 01118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Admin Commission (7%)</p>
              <p className="text-3xl font-bold text-red-600 mt-1">₦{adminCut.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">From all transactions</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Vendors' Net Earnings</p>
              <p className="text-3xl font-bold text-green-700 mt-1">₦{vendorsNet.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">After commission</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Vendors</span>
                <span className="text-sm font-medium text-gray-800">₦{vendorsNet.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(vendorsNet / gross) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Platform</span>
                <span className="text-sm font-medium text-gray-800">₦{adminCut.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(adminCut / gross) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Avg. Order Value</p>
              <p className="text-xl font-bold text-blue-800">
                ₦{paid.length > 0 ? Math.round(gross / paid.length).toLocaleString() : 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Commission Rate</p>
              <p className="text-xl font-bold text-purple-800">{COMMISSION * 100}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₦)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Gets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paid.length ? (
                paid.map(o => {
                  const orderCommission = Math.round(o.total * COMMISSION);
                  const vendorGets = o.total - orderCommission;
                  
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{o.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₦{orderCommission.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₦{vendorGets.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No transactions found</p>
                      <p className="text-sm">No paid orders in the selected time range</p>
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