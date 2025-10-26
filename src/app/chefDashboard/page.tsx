"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Order = {
  id: string;
  client: string;
  total: number;
  status: "pending" | "cooking" | "ready" | "completed" | "cancelled";
  createdAt: number;
  items: string[];
};

const ADMIN_RATE = 0.07;

export default function ChefOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: "ORD-2845",
        client: "Sarah Johnson",
        total: 4500,
        status: "completed",
        createdAt: new Date().setHours(10, 30),
        items: ["Jollof Rice with Chicken", "Chapman Drink"]
      },
      {
        id: "ORD-2846",
        client: "Michael Brown",
        total: 3200,
        status: "cooking",
        createdAt: new Date().setHours(11, 15),
        items: ["Pounded Yam & Egusi Soup"]
      },
      {
        id: "ORD-2847",
        client: "Jessica Williams",
        total: 2800,
        status: "pending",
        createdAt: new Date().setHours(11, 45),
        items: ["Fried Rice with Beef"]
      },
      {
        id: "ORD-2843",
        client: "David Wilson",
        total: 5200,
        status: "completed",
        createdAt: new Date(Date.now() - 86400000).getTime(),
        items: ["Nkwobi", "Palm Wine"]
      },
      {
        id: "ORD-2842",
        client: "Amara Okoro",
        total: 3800,
        status: "completed",
        createdAt: new Date(Date.now() - 172800000).getTime(),
        items: ["Abacha", "Ugba"]
      }
    ];
    setOrders(mockOrders);
  }, []);

  const completed = orders.filter(o => o.status === "completed");
  const revenueTotal = completed.reduce((s, o) => s + o.total, 0);
  const adminCut = Math.round(revenueTotal * ADMIN_RATE);
  const netToChef = revenueTotal - adminCut;

  const queueCount = orders.filter(o => ["pending", "cooking", "ready"].includes(o.status)).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cooking": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const last7 = useMemo(() => {
    const buckets: { label: string; amount: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      const dayOrders = orders.filter(o => o.status === "completed" && o.createdAt >= start && o.createdAt < end);
      const amount = dayOrders.reduce((s, o) => s + o.total, 0);
      buckets.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), amount, orders: dayOrders.length });
    }
    return buckets;
  }, [orders]);

  const maxAmt = Math.max(...last7.map(b => b.amount), 1);

  const recent = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  const stats = [
    {
      title: "Total Revenue",
      value: `₦${revenueTotal.toLocaleString()}`,
      subtitle: `Admin 7%: ₦${adminCut.toLocaleString()}`,
      icon: "💰",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Net Earnings",
      value: `₦${netToChef.toLocaleString()}`,
      subtitle: "After admin fees",
      icon: "💳",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Orders in Queue",
      value: queueCount.toString(),
      subtitle: "Pending preparation",
      icon: "⏳",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Completed Orders",
      value: completed.length.toString(),
      subtitle: "This week",
      icon: "✅",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chef Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your orders and track your earnings</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/chefDashboard/menu" 
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>🍳</span>
            Add New Dish
          </Link>
          <Link 
            href="/chefDashboard/orders" 
            className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-white hover:border-blue-500 transition-all flex items-center gap-2"
          >
            <span>📦</span>
            View All Orders
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {["today", "week", "month"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    timeFilter === period
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3 h-48 mt-8">
            {last7.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1">
                <div className="flex flex-col items-center gap-1 w-full">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                    style={{ height: `${(b.amount / maxAmt) * 120 || 5}px` }}
                    title={`₦${b.amount.toLocaleString()} - ${b.orders} orders`}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-900">₦{(b.amount / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500 mt-1">{b.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <span className="text-sm text-gray-500">{recent.length} orders</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {recent.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">New orders will appear here</p>
              </div>
            ) : recent.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">#{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.client}</p>
                    <p className="text-xs text-gray-500">
                      {order.items.slice(0, 2).join(", ")}
                      {order.items.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₦{order.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition-all text-left group">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-all">
              <span className="text-blue-600 group-hover:text-white">📊</span>
            </div>
            <p className="font-semibold text-gray-900">Performance Report</p>
            <p className="text-sm text-gray-500 mt-1">View detailed analytics</p>
          </button>
          
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 transition-all text-left group">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-500 transition-all">
              <span className="text-green-600 group-hover:text-white">👨‍🍳</span>
            </div>
            <p className="font-semibold text-gray-900">Update Schedule</p>
            <p className="text-sm text-gray-500 mt-1">Set availability hours</p>
          </button>
          
          <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-500 transition-all text-left group">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-all">
              <span className="text-purple-600 group-hover:text-white">💬</span>
            </div>
            <p className="font-semibold text-gray-900">Customer Reviews</p>
            <p className="text-sm text-gray-500 mt-1">Read feedback</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}