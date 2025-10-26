"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Order = {
  id: string;
  total: number;
  placedAt: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  customerName: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
};

const COMMISSION = 0.07; // 7%

export default function ChefEarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chefOrders");
    if (saved) {
      const parsedOrders = JSON.parse(saved);
      // Transform orders to match our type
      const transformedOrders: Order[] = parsedOrders.map((order: any) => ({
        id: order.id.toString(),
        total: order.total,
        placedAt: new Date(order.orderTime).getTime(),
        status: order.status,
        customerName: order.customerName,
        items: order.items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: 1
        }))
      }));
      setOrders(transformedOrders);
    } else {
      // Sample data for demonstration
      const sampleOrders: Order[] = [
        {
          id: "1001",
          total: 1800,
          placedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
          status: "completed",
          customerName: "Chidi Obi",
          items: [
            { name: "Jollof Rice with Chicken", price: 1800, quantity: 1 }
          ]
        },
        {
          id: "1002",
          total: 3200,
          placedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
          status: "completed",
          customerName: "Amina Yusuf",
          items: [
            { name: "Pepper Soup", price: 1500, quantity: 1 },
            { name: "Jollof Rice with Chicken", price: 1800, quantity: 1 }
          ]
        },
        {
          id: "1003",
          total: 1500,
          placedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
          status: "completed",
          customerName: "Emeka Nwosu",
          items: [
            { name: "Pepper Soup", price: 1500, quantity: 1 }
          ]
        }
      ];
      setOrders(sampleOrders);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    if (range === "all") return orders.filter(o => o.status === "completed");
    const now = Date.now();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => o.placedAt >= cutoff && o.status === "completed");
  }, [orders, range]);

  const stats = useMemo(() => {
    const gross = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
    const commission = Math.round(gross * COMMISSION);
    const net = gross - commission;
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(gross / orderCount) : 0;

    return { gross, commission, net, orderCount, avgOrderValue };
  }, [filteredOrders]);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed": return "bg-green/20 text-green";
      case "preparing": return "bg-blue-100 text-blue-600";
      case "ready": return "bg-yellow-100 text-yellow-600";
      case "pending": return "bg-orange-100 text-orange-600";
      case "cancelled": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Earnings & Analytics</h1>
          <p className="text-dark/70">Track your revenue and order performance</p>
        </div>

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
                <p className="text-dark/70 text-sm">Commission (7%)</p>
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
                  <th className="text-left p-4 font-semibold text-dark">Items</th>
                  <th className="text-left p-4 font-semibold text-dark">Amount</th>
                  <th className="text-left p-4 font-semibold text-dark">Status</th>
                  <th className="text-left p-4 font-semibold text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr 
                    key={order.id}
                    className="border-b border-dark/10 hover:bg-cream/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td className="p-4 font-medium text-dark">#{order.id}</td>
                    <td className="p-4 text-dark">{order.customerName}</td>
                    <td className="p-4 text-dark/70">{formatDate(order.placedAt)}</td>
                    <td className="p-4">
                      <div className="text-dark/80">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-olive-2">₦{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 bg-dark text-cream rounded-lg text-sm hover:bg-green transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
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

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-cream rounded-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-dark">Order Details</h3>
                  <button 
                    className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <span>✕</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-dark/70">Order ID:</span>
                    <span className="font-semibold text-dark">#{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/70">Customer:</span>
                    <span className="font-semibold text-dark">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/70">Date:</span>
                    <span className="font-semibold text-dark">{formatDate(selectedOrder.placedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/70">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>

                  <div className="border-t border-dark/20 pt-4">
                    <h4 className="font-semibold text-dark mb-3">Order Items:</h4>
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div>
                          <span className="text-dark">{item.name}</span>
                          <span className="text-dark/60 text-sm ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-dark font-semibold">₦{item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dark/20 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-dark">Total Amount:</span>
                      <span className="text-olive-2">₦{selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-dark/70 mt-2">
                      <span>Commission (7%):</span>
                      <span className="text-red-500">-₦{Math.round(selectedOrder.total * COMMISSION).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold mt-2">
                      <span>Your Earnings:</span>
                      <span className="text-green-600">₦{(selectedOrder.total - Math.round(selectedOrder.total * COMMISSION)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}