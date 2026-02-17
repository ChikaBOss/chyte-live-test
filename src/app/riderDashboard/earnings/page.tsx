"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Order = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
  customer: {
    name: string;
    address: string;
  };
  deliveryFee: number;
  distribution?: {
    riderAmount: number;
  };
};

type Stats = {
  today: number;
  week: number;
  month: number;
  total: number;
  deliveries: number;
};

type Transaction = {
  _id: string;
  amount: number;
  createdAt: string;
  source: string;
  metadata?: {
    description?: string;
  };
};

export default function RiderEarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    deliveries: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState({
    balance: 0,
    pending: 0,
    totalEarned: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all">("week");

  useEffect(() => {
    fetchEarnings();
  }, [timeframe]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      const range = timeframe === "today" ? "today" : 
                   timeframe === "week" ? "7d" : 
                   timeframe === "month" ? "30d" : "all";
      
      const response = await fetch(`/api/rider/earnings?range=${range}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats);
        setWallet(data.wallet);
        setTransactions(data.recentTransactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }

  // Prepare chart data
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Earnings (₦)",
        data: generateWeeklyEarnings(orders),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `₦${value.toLocaleString()}`
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Earnings</h1>
          <p className="text-gray-600">Track your delivery earnings and performance</p>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Available Balance</h2>
              <p className="text-3xl font-bold">₦{wallet.balance.toLocaleString()}</p>
              <p className="text-blue-100 mt-2">
                Pending: ₦{wallet.pending.toLocaleString()} • 
                Total Earned: ₦{wallet.totalEarned.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/rider/payouts'}
              disabled={wallet.balance < 1000}
              className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold transition-colors ${
                wallet.balance >= 1000
                  ? "bg-white text-blue-600 hover:bg-blue-50"
                  : "bg-blue-400 text-white cursor-not-allowed"
              }`}
            >
              Withdraw Funds
            </button>
          </div>
        </motion.div>

        {/* Time Filter */}
        <div className="flex gap-2 mb-8">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "all", label: "All Time" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeframe === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">Today's Earnings</p>
            <p className="text-2xl font-bold text-gray-900">₦{stats.today.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">This Week</p>
            <p className="text-2xl font-bold text-gray-900">₦{stats.week.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">This Month</p>
            <p className="text-2xl font-bold text-gray-900">₦{stats.month.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">Total Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{stats.deliveries}</p>
          </div>
        </div>

        {/* Chart and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Chart */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Earnings Trend</h3>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction, index) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.metadata?.description || "Delivery Payment"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-bold">+₦{transaction.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.source.replace("_", " ")}</p>
                  </div>
                </motion.div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions yet</p>
                  <p className="text-sm">Completed deliveries will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Deliveries Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Deliveries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{order.customer.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">₦{order.deliveryFee.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      ₦{(order.distribution?.riderAmount || order.deliveryFee).toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-3">🚚</div>
                        <p>No deliveries in this period</p>
                        <p className="text-sm">Completed deliveries will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateWeeklyEarnings(orders: Order[]): number[] {
  // Generate dummy weekly data for chart
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Group orders by day of week
  const earningsByDay = days.map(() => 0);
  
  orders.forEach(order => {
    const day = new Date(order.createdAt).getDay();
    const earnings = order.distribution?.riderAmount || order.deliveryFee;
    earningsByDay[(day + 6) % 7] += earnings; // Convert to Mon-Sun
  });
  
  return earningsByDay;
}