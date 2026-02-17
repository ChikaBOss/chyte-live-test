"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Order = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  items: any[];
  subtotal: number;
  adminFee: number;
  distribution?: {
    vendorAmount: number;
    platformAmount: number;
  };
};

type Stats = {
  gross: number;
  commission: number;
  net: number;
  orderCount: number;
  avgOrderValue: number;
};

type Wallet = {
  balance: number;
  pending: number;
  totalEarned: number;
};

export default function ChefEarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    gross: 0,
    commission: 0,
    net: 0,
    orderCount: 0,
    avgOrderValue: 0
  });
  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
    pending: 0,
    totalEarned: 0
  });
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, [range]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/earnings?range=${range}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats);
        setWallet(data.wallet || {
          balance: 0,
          pending: 0,
          totalEarned: 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.status === "COMPLETED" || 
      o.status === "DELIVERED"
    );
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
        return "bg-green/20 text-green";
      case "PROCESSING":
        return "bg-blue-100 text-blue-600";
      case "READY":
        return "bg-yellow-100 text-yellow-600";
      case "PENDING_PAYMENT":
        return "bg-orange-100 text-orange-600";
      case "CANCELLED":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleWithdraw = async () => {
    // Open withdrawal modal or redirect to payout page
    window.location.href = '/vendor/payouts';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto"></div>
          <p className="mt-4 text-dark">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Earnings & Analytics</h1>
          <p className="text-dark/70">Track your revenue and order performance</p>
        </div>

        {/* Wallet Balance Card */}
        <motion.div 
          className="bg-gradient-to-r from-green to-olive text-cream rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Available Balance</h2>
              <p className="text-3xl font-bold">₦{wallet.balance.toLocaleString()}</p>
              <p className="text-cream/80 mt-2">
                Pending: ₦{wallet.pending.toLocaleString()} • 
                Total Earned: ₦{wallet.totalEarned.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={wallet.balance < 1000}
              className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold transition-colors ${
                wallet.balance >= 1000
                  ? "bg-cream text-green hover:bg-cream/90"
                  : "bg-cream/50 text-green/50 cursor-not-allowed"
              }`}
            >
              Withdraw Funds
            </button>
          </div>
        </motion.div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-2xl shadow-lg">
          <span className="text-dark font-medium">Time Range:</span>
          <div className="flex gap-2">
            {[
              { value: "7d" as const, label: "Last 7 Days" },
              { value: "30d" as const, label: "Last 30 Days" },
              { value: "90d" as const, label: "Last 90 Days" },
              { value: "all" as const, label: "All Time" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRange(option.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  range === option.value
                    ? "bg-green text-cream"
                    : "bg-cream text-dark hover:bg-dark/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Gross Revenue</p>
                <p className="text-2xl font-bold text-olive-2">₦{stats.gross.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green/20 rounded-full flex items-center justify-center">
                <span className="text-green text-xl">₦</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Platform Commission</p>
                <p className="text-2xl font-bold text-red-500">₦{stats.commission.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-xl">📊</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Net Earnings</p>
                <p className="text-2xl font-bold text-green-600">₦{stats.net.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green/20 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">💳</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-blue-500">{stats.orderCount}</p>
                <p className="text-sm text-dark/60">Avg: ₦{stats.avgOrderValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 text-xl">📦</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders Table */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 border-b border-dark/10">
            <h3 className="text-xl font-bold text-dark">Order History ({filteredOrders.length} orders)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cream border-b border-dark/10">
                  <th className="text-left p-4 font-semibold text-dark">Order ID</th>
                  <th className="text-left p-4 font-semibold text-dark">Customer</th>
                  <th className="text-left p-4 font-semibold text-dark">Date</th>
                  <th className="text-left p-4 font-semibold text-dark">Amount</th>
                  <th className="text-left p-4 font-semibold text-dark">Commission</th>
                  <th className="text-left p-4 font-semibold text-dark">You Get</th>
                  <th className="text-left p-4 font-semibold text-dark">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const vendorAmount = order.distribution?.vendorAmount || 
                    (order.subtotal - order.adminFee);
                  
                  return (
                    <motion.tr 
                      key={order._id}
                      className="border-b border-dark/10 hover:bg-cream/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="p-4 font-medium text-dark">#{order.orderNumber}</td>
                      <td className="p-4 text-dark">{order.customer.name}</td>
                      <td className="p-4 text-dark/70">{formatDate(order.createdAt)}</td>
                      <td className="p-4 font-semibold text-dark">₦{order.totalAmount.toLocaleString()}</td>
                      <td className="p-4 text-red-500">-₦{order.adminFee.toLocaleString()}</td>
                      <td className="p-4 font-bold text-green-600">₦{vendorAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-dark/60">
                <div className="text-4xl mb-3">💸</div>
                <p>No completed orders in this period</p>
                <p className="text-sm">Completed orders will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}