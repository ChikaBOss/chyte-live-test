"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  customer: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  total: number;
  specialInstructions: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    { 
      id: "ORD-1234", 
      customer: "Sarah Johnson", 
      date: "2023-10-15 14:30", 
      status: "pending", 
      total: 12500, 
      items: [
        { name: "Jollof Rice with Chicken", quantity: 2, price: 2500 },
        { name: "Chapman Drink", quantity: 2, price: 1500 }
      ],
      specialInstructions: "Please make the jollof rice extra spicy" 
    },
    { 
      id: "ORD-1235", 
      customer: "Michael Brown", 
      date: "2023-10-15 13:45", 
      status: "preparing", 
      total: 8300, 
      items: [
        { name: "Pounded Yam & Egusi Soup", quantity: 1, price: 3500 },
        { name: "Small Pepsi", quantity: 1, price: 300 }
      ],
      specialInstructions: "Add extra meat to the soup" 
    },
    { 
      id: "ORD-1236", 
      customer: "Jessica Williams", 
      date: "2023-10-15 12:20", 
      status: "ready", 
      total: 21500, 
      items: [
        { name: "Party Jollof Rice (Large)", quantity: 1, price: 12000 },
        { name: "Grilled Chicken (10 pieces)", quantity: 1, price: 8500 },
        { name: "Bottled Water", quantity: 5, price: 200 }
      ],
      specialInstructions: "Package everything properly for travel" 
    },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-mustard text-cream";
      case "preparing": return "bg-olive text-cream";
      case "ready": return "bg-green text-cream";
      case "completed": return "bg-dark text-cream";
      case "cancelled": return "bg-gray-500 text-cream";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case "pending": return ["Accept", "Cancel"];
      case "preparing": return ["Mark as Ready", "Cancel"];
      case "ready": return ["Mark as Completed"];
      default: return [];
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-dark">Food Orders</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-dark">Last updated: Just now</span>
          <button className="bg-cream text-olive px-3 py-1 rounded-lg border border-olive text-sm">
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cream rounded-xl p-4 border border-olive">
          <p className="text-sm text-olive">New Orders</p>
          <p className="text-2xl font-bold text-dark">3</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-mustard">
          <p className="text-sm text-mustard">Preparing</p>
          <p className="text-2xl font-bold text-dark">2</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-green">
          <p className="text-sm text-green">Ready</p>
          <p className="text-2xl font-bold text-dark">1</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-dark">
          <p className="text-sm text-dark">Today's Revenue</p>
          <p className="text-2xl font-bold text-dark">₦42,300</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark">Active Orders</h2>
          <div className="flex space-x-2">
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Preparing</option>
              <option>Ready</option>
            </select>
            <input
              type="text"
              placeholder="Search orders..."
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
            />
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-dark">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">Customer: {order.customer}</p>
                  <p className="text-sm text-gray-500">Placed at: {order.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-dark mb-1">Order Items:</h4>
                <ul className="text-sm text-gray-700">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₦{item.price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between border-t border-gray-200 mt-2 pt-2 font-semibold">
                  <span>Total:</span>
                  <span>₦{order.total.toLocaleString()}</span>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="mb-3">
                  <h4 className="font-medium text-dark mb-1">Special Instructions:</h4>
                  <p className="text-sm text-gray-700 bg-cream p-2 rounded-lg">{order.specialInstructions}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {getStatusActions(order.status).map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      let newStatus: Order["status"] = "pending";
                      if (action === "Accept") newStatus = "preparing";
                      if (action === "Mark as Ready") newStatus = "ready";
                      if (action === "Mark as Completed") newStatus = "completed";
                      if (action === "Cancel") newStatus = "cancelled";
                      updateOrderStatus(order.id, newStatus);
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      action === "Cancel" 
                        ? "bg-dark text-cream hover:bg-gray-700" 
                        : "bg-olive text-cream hover:bg-olive-2"
                    }`}
                  >
                    {action}
                  </button>
                ))}
                <button className="px-3 py-1 rounded-lg text-sm font-medium border border-olive text-olive hover:bg-cream">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">Showing {orders.length} active orders</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              Previous
            </button>
            <button className="px-3 py-1 bg-olive text-cream rounded-lg">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}