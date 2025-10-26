"use client";
import { motion } from "framer-motion";

export default function EarningsPage() {
  const earningsData = {
    today: 3500,
    week: 15800,
    month: 45200,
    total: 128500,
    deliveries: 45
  };

  const recentTransactions = [
    { id: 1, customer: "John Doe", amount: 1500, time: "2 hours ago", status: "completed" },
    { id: 2, customer: "Ada Johnson", amount: 1200, time: "4 hours ago", status: "completed" },
    { id: 3, customer: "Mike Tyson", amount: 800, time: "6 hours ago", status: "completed" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Earnings</h1>
        <p className="text-dark/70">Track your delivery earnings and performance</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", value: earningsData.today, color: "bg-green" },
          { label: "This Week", value: earningsData.week, color: "bg-mustard" },
          { label: "This Month", value: earningsData.month, color: "bg-olive" },
          { label: "Total", value: earningsData.total, color: "bg-dark" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.color} text-cream rounded-2xl p-6 shadow-lg`}
          >
            <p className="text-cream/80 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold">₦{stat.value.toLocaleString()}</p>
            <div className="w-full bg-cream/20 rounded-full h-2 mt-2">
              <motion.div 
                className="bg-cream h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(stat.value / earningsData.total) * 100}%` }}
                transition={{ delay: index * 0.2 + 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-dark mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              className="flex justify-between items-center p-4 bg-cream rounded-xl hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-semibold text-dark">{transaction.customer}</p>
                <p className="text-dark/60 text-sm">{transaction.time}</p>
              </div>
              <div className="text-right">
                <p className="text-green font-bold">+₦{transaction.amount.toLocaleString()}</p>
                <p className="text-dark/60 text-sm">{transaction.status}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}