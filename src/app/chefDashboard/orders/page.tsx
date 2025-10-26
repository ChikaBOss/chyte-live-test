"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Order = {
  id: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  placedAt: number;
  customer: string;
  specialInstructions?: string;
};

export default function ChefOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: "ORD-2847",
        customer: "Sarah Johnson",
        items: [
          { name: "Jollof Rice Deluxe", price: 1800, qty: 2 },
          { name: "Grilled Chicken", price: 1200, qty: 2 },
          { name: "Chapman Drink", price: 800, qty: 2 },
        ],
        total: 7600,
        status: "pending",
        placedAt: Date.now() - 300000, // 5 minutes ago
        specialInstructions: "Please make the jollof rice extra spicy"
      },
      {
        id: "ORD-2846",
        customer: "Michael Brown",
        items: [
          { name: "Pounded Yam & Egusi Soup", price: 2500, qty: 1 },
          { name: "Assorted Meat", price: 1500, qty: 1 },
        ],
        total: 4000,
        status: "preparing",
        placedAt: Date.now() - 900000, // 15 minutes ago
      },
      {
        id: "ORD-2845",
        customer: "Jessica Williams",
        items: [
          { name: "Fried Rice with Beef", price: 2200, qty: 3 },
          { name: "Small Pepsi", price: 300, qty: 3 },
        ],
        total: 7500,
        status: "ready",
        placedAt: Date.now() - 1800000, // 30 minutes ago
      },
      {
        id: "ORD-2844",
        customer: "David Wilson",
        items: [
          { name: "Nkwobi", price: 2800, qty: 1 },
          { name: "Palm Wine", price: 1500, qty: 2 },
        ],
        total: 5800,
        status: "completed",
        placedAt: Date.now() - 86400000, // 1 day ago
      },
    ];
    setOrders(mockOrders);
  }, []);

  const filteredOrders = filter === "all" ? orders : orders.filter(order => order.status === filter);

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      ready: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order["status"]) => {
    const icons = {
      pending: "⏳",
      preparing: "👨‍🍳",
      ready: "✅",
      completed: "📦",
      cancelled: "❌",
    };
    return icons[status];
  };

  const updateStatus = (id: string, status: Order["status"]) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    // In real app, you would save to localStorage or API
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getNextStatus = (currentStatus: Order["status"]) => {
    const flow: Record<Order["status"], Order["status"] | null> = {
      pending: "preparing",
      preparing: "ready",
      ready: "completed",
      completed: null,
      cancelled: null,
    };
    return flow[currentStatus];
  };

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const preparingCount = orders.filter(o => o.status === "preparing").length;
  const readyCount = orders.filter(o => o.status === "ready").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>
        
        {/* Stats Overview */}
        <div className="flex gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-w-32">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-w-32">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg">👨‍🍳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{preparingCount}</p>
                <p className="text-sm text-gray-500">Preparing</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-w-32">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{readyCount}</p>
                <p className="text-sm text-gray-500">Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 mb-8">
        <div className="flex gap-1">
          {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === status
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
                    <p className="text-gray-600">{order.customer}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    <span className="mr-1">{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Placed {getTimeAgo(order.placedAt)}</span>
                  <span className="font-semibold text-gray-900">₦{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-700">
                          {item.qty}x {item.name}
                        </span>
                      </div>
                      <span className="text-gray-900 font-medium">₦{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Note:</span> {order.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-2">
                  {order.status !== "completed" && order.status !== "cancelled" && (
                    <button
                      onClick={() => updateStatus(order.id, getNextStatus(order.status)!)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      {order.status === "pending" && "Start Preparing"}
                      {order.status === "preparing" && "Mark as Ready"}
                      {order.status === "ready" && "Complete Order"}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    View
                  </button>
                  
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">There are no orders matching your current filter.</p>
        </motion.div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h2>
                    <p className="text-gray-600">{selectedOrder.customer}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </div>
                  <span className="text-gray-500">Placed {getTimeAgo(selectedOrder.placedAt)}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">₦{item.price.toLocaleString()} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₦{(item.price * item.qty).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                      <div className="flex justify-between items-center text-white">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-xl font-bold">₦{selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Order Actions</h3>
                    <div className="space-y-3">
                      {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            updateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                            setSelectedOrder(null);
                          }}
                          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                          {selectedOrder.status === "pending" && "Start Preparing"}
                          {selectedOrder.status === "preparing" && "Mark as Ready"}
                          {selectedOrder.status === "ready" && "Complete Order"}
                        </button>
                      )}
                      
                      {selectedOrder.status === "pending" && (
                        <button
                          onClick={() => {
                            updateStatus(selectedOrder.id, "cancelled");
                            setSelectedOrder(null);
                          }}
                          className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                        >
                          Cancel Order
                        </button>
                      )}

                      {selectedOrder.specialInstructions && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Special Instructions</h4>
                          <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            {selectedOrder.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}