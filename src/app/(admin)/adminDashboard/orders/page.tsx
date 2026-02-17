"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  userEmail: string;
  vendorName: string;
  total: number;      // in NGN
  status: "pending" | "paid" | "delivered" | "cancelled";
  createdAt: number;
};

const statuses = ["pending", "paid", "delivered", "cancelled"] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<"" | Order["status"]>("");
  const [vendorQ, setVendorQ] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("orders");
    if (!raw) {
      const seed: Order[] = [
        { id: "o1", userEmail: "john@ex.com", vendorName: "SEKANI", total: 3200, status: "paid", createdAt: Date.now() - 3600000 },
        { id: "o2", userEmail: "ada@ex.com", vendorName: "Sonic Foods", total: 2500, status: "pending", createdAt: Date.now() - 7200000 },
        { id: "o3", userEmail: "mike@ex.com", vendorName: "Fresh Mart", total: 4500, status: "delivered", createdAt: Date.now() - 86400000 },
        { id: "o4", userEmail: "sarah@ex.com", vendorName: "Quick Bites", total: 1800, status: "cancelled", createdAt: Date.now() - 172800000 },
        { id: "o5", userEmail: "david@ex.com", vendorName: "SEKANI", total: 5200, status: "paid", createdAt: Date.now() - 259200000 },
      ];
      localStorage.setItem("orders", JSON.stringify(seed));
      setOrders(seed);
    } else {
      setOrders(JSON.parse(raw));
    }
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(o =>
        (status ? o.status === status : true) &&
        (vendorQ ? o.vendorName.toLowerCase().includes(vendorQ.toLowerCase()) : true)
      ),
    [orders, status, vendorQ]
  );

  // Calculate order statistics
  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      paid: orders.filter(o => o.status === "paid").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
      revenue: orders.filter(o => o.status === "paid" || o.status === "delivered")
                 .reduce((sum, order) => sum + order.total, 0)
    };
  }, [orders]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Orders Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={vendorQ}
              onChange={(e) => setVendorQ(e.target.value)}
              placeholder="Search vendor..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{orderStats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{orderStats.paid + orderStats.delivered}</p>
              <p className="text-xs text-gray-500 mt-1">₦{orderStats.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{orderStats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Cancelled Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{orderStats.cancelled}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length ? (
                filtered.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{o.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{o.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{o.vendorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₦{o.total.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        o.status === "paid" ? "bg-blue-100 text-blue-800" :
                        o.status === "delivered" ? "bg-green-100 text-green-800" :
                        o.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
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