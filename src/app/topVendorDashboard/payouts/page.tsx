"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  method: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([
    { id: "PO-1234", date: "2023-10-05", amount: 72350, status: "completed", method: "Bank Transfer" },
    { id: "PO-1235", date: "2023-09-05", amount: 65320, status: "completed", method: "Bank Transfer" },
    { id: "PO-1236", date: "2023-08-05", amount: 58210, status: "completed", method: "Bank Transfer" },
    { id: "PO-1237", date: "2023-10-10", amount: 45000, status: "processing", method: "Bank Transfer" },
    { id: "PO-1238", date: "2023-10-15", amount: 81130, status: "pending", method: "Bank Transfer" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-mustard text-cream";
      case "processing": return "bg-olive text-cream";
      case "completed": return "bg-green text-cream";
      case "failed": return "bg-dark text-cream";
      default: return "bg-gray-200 text-gray-800";
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
        <h1 className="text-3xl font-bold text-dark">Payouts</h1>
        <button className="bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition">
          Request Payout
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cream rounded-xl p-4 border border-olive">
          <p className="text-sm text-olive">Available for Payout</p>
          <p className="text-2xl font-bold text-dark">₦81,130</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-mustard">
          <p className="text-sm text-mustard">Pending Payouts</p>
          <p className="text-2xl font-bold text-dark">₦45,000</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-green">
          <p className="text-sm text-green">Total Paid Out</p>
          <p className="text-2xl font-bold text-dark">₦195,880</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark">Payout History</h2>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-dark">Payout ID</th>
                <th className="pb-3 text-left text-dark">Date</th>
                <th className="pb-3 text-left text-dark">Amount</th>
                <th className="pb-3 text-left text-dark">Status</th>
                <th className="pb-3 text-left text-dark">Method</th>
                <th className="pb-3 text-left text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout, index) => (
                <motion.tr
                  key={payout.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-cream/30"
                >
                  <td className="py-4 text-dark font-medium">{payout.id}</td>
                  <td className="py-4 text-dark">{payout.date}</td>
                  <td className="py-4 text-dark">₦{payout.amount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payout.status)}`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 text-dark">{payout.method}</td>
                  <td className="py-4">
                    <button className="text-olive hover:text-olive-2 font-medium text-sm">
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">Showing 5 of 12 payouts</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              Previous
            </button>
            <button className="px-3 py-1 bg-olive text-cream rounded-lg">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              2
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-dark hover:bg-cream">
              Next
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-dark mb-4">Payout Method</h2>
        <div className="flex items-center justify-between p-4 border border-olive rounded-xl">
          <div className="flex items-center">
            <div className="bg-cream p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-dark">Bank Transfer</p>
              <p className="text-sm text-gray-500">**** **** **** 1234</p>
            </div>
          </div>
          <button className="text-olive hover:text-olive-2 font-medium">
            Edit
          </button>
        </div>
      </motion.div>
    </div>
  );
}