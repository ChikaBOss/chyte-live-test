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
  subtotal: number;
  adminFee: number;
  distribution?: {
    vendorAmount: number;
  };
};

export default function PharmacyEarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [wallet, setWallet] = useState({
    balance: 0,
    pending: 0,
    totalEarned: 0,
    role: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, [range]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/earnings?range=${range}`);
      const data = await response.json();
      
      console.log("🏥 PHARMACY API RESPONSE:", data);
      
      if (data.success) {
        setOrders(data.orders || []);
        setWallet(data.wallet || { balance: 0, pending: 0, totalEarned: 0, role: "pharmacy" });
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.status === "PAID" || 
      o.status === "COMPLETED" || 
      o.status === "DELIVERED"
    );
  }, [orders]);

  const stats = useMemo(() => {
    const gross = filteredOrders.reduce((s, o) => s + o.subtotal, 0);
    const commission = filteredOrders.reduce((s, o) => s + o.adminFee, 0);
    const net = filteredOrders.reduce((s, o) => s + (o.distribution?.vendorAmount || (o.subtotal - o.adminFee)), 0);
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(gross / orderCount) : 0;

    return { gross, commission, net, orderCount, avgOrderValue };
  }, [filteredOrders]);

  const handleWithdraw = () => {
    window.location.href = '/pharmacy/payouts';
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
          <h1 className="text-3xl font-bold text-dark mb-2">Pharmacy Earnings Dashboard</h1>
          <p className="text-dark/70">Track your pharmacy sales and earnings</p>
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
              <p className="text-4xl font-bold">₦{wallet.balance.toLocaleString()}</p>
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
          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-dark/70 text-sm">Gross Revenue</p>
            <p className="text-2xl font-bold text-olive-2">
              ₦{stats.gross.toLocaleString()}
            </p>
            <p className="text-xs text-dark/60 mt-1">
              From {stats.orderCount} orders
            </p>
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-dark/70 text-sm">Platform Commission (12%)</p>
            <p className="text-2xl font-bold text-red-500">
              ₦{stats.commission.toLocaleString()}
            </p>
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-dark/70 text-sm">Net Earnings</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{stats.net.toLocaleString()}
            </p>
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-dark/70 text-sm">Avg Order Value</p>
            <p className="text-2xl font-bold text-blue-500">
              ₦{stats.avgOrderValue.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Orders Table */}
        <motion.div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-dark/10">
            <h3 className="text-xl font-bold text-dark">
              Order History ({filteredOrders.length} orders)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream">
                <tr>
                  <th className="text-left p-4 font-semibold text-dark">Order #</th>
                  <th className="text-left p-4 font-semibold text-dark">Customer</th>
                  <th className="text-left p-4 font-semibold text-dark">Date</th>
                  <th className="text-left p-4 font-semibold text-dark">Subtotal</th>
                  <th className="text-left p-4 font-semibold text-dark">Commission</th>
                  <th className="text-left p-4 font-semibold text-dark">You Get</th>
                  <th className="text-left p-4 font-semibold text-dark">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-dark/10 hover:bg-cream/50">
                    <td className="p-4 font-medium">#{order.orderNumber}</td>
                    <td className="p-4">{order.customer.name}</td>
                    <td className="p-4 text-dark/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold">₦{order.subtotal.toLocaleString()}</td>
                    <td className="p-4 text-red-500">-₦{order.adminFee.toLocaleString()}</td>
                    <td className="p-4 font-bold text-green-600">
                      ₦{(order.distribution?.vendorAmount || (order.subtotal - order.adminFee)).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-dark/60">
                      <div className="text-4xl mb-3">💊</div>
                      <p>No pharmacy orders found in this period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}