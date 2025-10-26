"use client";

import { motion, type Variants } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboardPage() {
  // Chart data for orders
  const ordersChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Orders",
        data: [32, 45, 28, 55, 42, 60, 48],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Doughnut chart data for vendor types
  const vendorTypeData = {
    labels: ["Regular Vendors", "Top Vendors", "Chefs", "Pharmacies"],
    datasets: [
      {
        data: [45, 15, 25, 15],
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Animation variants (typed)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 14, duration: 0.35 },
    },
  };

  // Reusable tiny icons (valid paths)
  const IconTrendDown = ({ className = "h-4 w-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );
  const IconTrendUp = ({ className = "h-4 w-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
  const IconClock = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
    </svg>
  );
  const IconBag = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
  const IconBolt = ({ className = "h-4 w-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50 relative">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Pending Vendors */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Vendors</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">3</p>
              <div className="flex items-center mt-2">
                <IconTrendDown className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500 ml-1">2% from last week</span>
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <IconClock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        {/* Active Chefs */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Chefs</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">12</p>
              <div className="flex items-center mt-2">
                <IconTrendUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">8% from last week</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              {/* simple chef-ish placeholder: use a bag or clock; replace with your preferred icon */}
              <IconBag className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Pharmacy Orders */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pharmacy Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">27</p>
              <div className="flex items-center mt-2">
                <IconTrendUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">15% from yesterday</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <IconBag className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Today's Orders */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today&apos;s Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">42</p>
              <div className="flex items-center mt-2">
                <IconTrendUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">12% from yesterday</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <IconBag className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders Chart */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Orders</h2>
          <div className="h-64">
            <Bar
              data={ordersChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" } },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Vendor Distribution Chart */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vendor Distribution</h2>
          <div className="h-64">
            <Doughnut
              data={vendorTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "New vendor registration", name: "Fresh Foods", time: "10 minutes ago" },
              { action: "Order completed", name: "Order #3245", time: "1 hour ago" },
              { action: "Payment processed", name: "$245.99", time: "3 hours ago" },
              { action: "New chef added", name: "Maria Rodriguez", time: "Yesterday" },
              { action: "Pharmacy restocked", name: "MedPlus", time: "2 days ago" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-indigo-50 transition-colors"
                whileHover={{ x: 5 }}
              >
                <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                  <IconBolt className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {item.action} <span className="text-indigo-600">{item.name}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Add Vendor", color: "bg-blue-500" },
              { label: "Approve", color: "bg-green-500" },
              { label: "Manage Chefs", color: "bg-purple-500" },
              { label: "Pharmacy Orders", color: "bg-red-500" },
              { label: "View Reports", color: "bg-indigo-500" },
              { label: "Settings", color: "bg-gray-500" },
            ].map((item, index) => (
              <motion.button
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`p-3 rounded-lg mb-2 ${item.color} text-white`}>
                  <IconBolt className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}