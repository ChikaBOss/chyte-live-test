"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Earning {
  date: string;
  orders: number;
  gross: number;
  fees: number;
  net: number;
}

export default function EarningsPage() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [earnings, setEarnings] = useState<Earning[]>([
    { date: "Oct 2023", orders: 24, gross: 185400, fees: 9270, net: 176130 },
    { date: "Sep 2023", orders: 31, gross: 245600, fees: 12280, net: 233320 },
    { date: "Aug 2023", orders: 28, gross: 212300, fees: 10615, net: 201685 },
    { date: "Jul 2023", orders: 22, gross: 168900, fees: 8445, net: 160455 },
    { date: "Jun 2023", orders: 19, gross: 143500, fees: 7175, net: 136325 },
  ]);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-dark">Earnings</h1>
        <div className="flex space-x-2 bg-cream p-1 rounded-lg">
          <button
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-1 rounded-lg ${timeframe === "weekly" ? "bg-olive text-cream" : "text-dark"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe("monthly")}
            className={`px-4 py-1 rounded-lg ${timeframe === "monthly" ? "bg-olive text-cream" : "text-dark"}`}
          >
            Monthly
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cream rounded-xl p-4 border border-olive">
          <p className="text-sm text-olive">Total Earnings</p>
          <p className="text-2xl font-bold text-dark">₦907,915</p>
          <p className="text-xs text-dark mt-1">Lifetime</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-mustard">
          <p className="text-sm text-mustard">This Month</p>
          <p className="text-2xl font-bold text-dark">₦176,130</p>
          <p className="text-xs text-green mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            +12% from last month
          </p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-green">
          <p className="text-sm text-green">Available for Payout</p>
          <p className="text-2xl font-bold text-dark">₦81,130</p>
          <button className="text-xs bg-green text-cream px-2 py-1 rounded mt-2">
            Request Payout
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-dark mb-6">Earnings History</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-dark">Period</th>
                <th className="pb-3 text-left text-dark">Orders</th>
                <th className="pb-3 text-left text-dark">Gross Sales</th>
                <th className="pb-3 text-left text-dark">Fees (5%)</th>
                <th className="pb-3 text-left text-dark">Net Earnings</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning, index) => (
                <motion.tr
                  key={earning.date}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-cream/30"
                >
                  <td className="py-4 text-dark font-medium">{earning.date}</td>
                  <td className="py-4 text-dark">{earning.orders}</td>
                  <td className="py-4 text-dark">₦{earning.gross.toLocaleString()}</td>
                  <td className="py-4 text-dark">-₦{earning.fees.toLocaleString()}</td>
                  <td className="py-4 text-green font-semibold">₦{earning.net.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-dark mb-4">Earnings Chart</h3>
          <div className="bg-cream rounded-xl p-4 h-64 flex items-center justify-center">
            <p className="text-dark">Earnings visualization chart would appear here</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}