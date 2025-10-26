"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [performanceData, setPerformanceData] = useState({});

  useEffect(() => {
    // Dummy performance data
    const dummyData = {
      week: {
        deliveries: {
          completed: 45,
          onTime: 38,
          late: 7,
          successRate: 84
        },
        earnings: {
          total: 67500,
          averagePerDelivery: 1500,
          tips: 3200
        },
        ratings: {
          average: 4.8,
          totalReviews: 45,
          distribution: [5, 12, 25, 3, 0] // 5★,4★,3★,2★,1★
        },
        efficiency: {
          averageDeliveryTime: 28, // minutes
          fastestDelivery: 12,
          longestDelivery: 45
        }
      },
      month: {
        deliveries: {
          completed: 180,
          onTime: 155,
          late: 25,
          successRate: 86
        },
        earnings: {
          total: 275000,
          averagePerDelivery: 1527,
          tips: 12500
        },
        // ... similar structure for month
      }
    };
    setPerformanceData(dummyData);
  }, []);

  const currentData = performanceData[timeRange] || performanceData.week;

  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-dark/70">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark">Performance Analytics</h1>
          <p className="text-dark/70">Track your delivery performance and metrics</p>
        </div>
        
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-mustard/30 rounded-lg p-2 bg-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green to-mustard rounded-2xl p-6 text-cream"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Performance Score</h2>
            <p className="text-cream/80">Based on your delivery metrics</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">92%</div>
            <p className="text-cream/80">Excellent! 🎉</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Completed Deliveries"
          value={currentData.deliveries.completed}
          change="+12%"
          icon="📦"
          color="bg-green"
        />
        <StatCard 
          title="On-Time Rate"
          value={`${currentData.deliveries.successRate}%`}
          change="+5%"
          icon="⏱️"
          color="bg-olive"
        />
        <StatCard 
          title="Average Rating"
          value={currentData.ratings.average}
          change="+0.2"
          icon="⭐"
          color="bg-mustard"
        />
        <StatCard 
          title="Avg. Delivery Time"
          value={`${currentData.efficiency.averageDeliveryTime}m`}
          change="-3m"
          icon="⚡"
          color="bg-dark"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Success Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-mustard/20"
        >
          <h3 className="text-xl font-bold text-dark mb-4">Delivery Success Rate</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative">
              {/* Circular Progress */}
              <div className="w-32 h-32 rounded-full border-8 border-cream">
                <div 
                  className="w-full h-full rounded-full border-8 border-green transition-all duration-1000"
                  style={{
                    background: `conic-gradient(
                      green 0% ${currentData.deliveries.successRate}%, 
                      #FCFBF1 ${currentData.deliveries.successRate}% 100%
                    )`
                  }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-dark">{currentData.deliveries.successRate}%</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <div className="text-center">
              <div className="w-3 h-3 bg-green rounded-full mx-auto mb-1"></div>
              <span className="text-dark/70">On Time</span>
              <p className="font-bold text-dark">{currentData.deliveries.onTime}</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
              <span className="text-dark/70">Late</span>
              <p className="font-bold text-dark">{currentData.deliveries.late}</p>
            </div>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-mustard/20"
        >
          <h3 className="text-xl font-bold text-dark mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars, index) => {
              const count = currentData.ratings.distribution[index] || 0;
              const percentage = (count / currentData.ratings.totalReviews) * 100;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-dark font-medium w-8">{stars}★</span>
                  <div className="flex-1 bg-cream rounded-full h-4">
                    <motion.div 
                      className="bg-mustard h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                    />
                  </div>
                  <span className="text-dark/70 text-sm w-8">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-dark/70">Based on {currentData.ratings.totalReviews} reviews</p>
          </div>
        </motion.div>
      </div>

      {/* Efficiency Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-mustard/20"
      >
        <h3 className="text-xl font-bold text-dark mb-6">Efficiency Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-cream rounded-xl">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-dark/70">Average Time</p>
            <p className="text-2xl font-bold text-dark">{currentData.efficiency.averageDeliveryTime} min</p>
          </div>
          <div className="text-center p-4 bg-cream rounded-xl">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-dark/70">Fastest Delivery</p>
            <p className="text-2xl font-bold text-dark">{currentData.efficiency.fastestDelivery} min</p>
          </div>
          <div className="text-center p-4 bg-cream rounded-xl">
            <div className="text-3xl mb-2">🐌</div>
            <p className="text-dark/70">Longest Delivery</p>
            <p className="text-2xl font-bold text-dark">{currentData.efficiency.longestDelivery} min</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-mustard/20"
      >
        <h3 className="text-xl font-bold text-dark mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "🚀", title: "Speed Demon", desc: "5 deliveries under 15min", earned: "Today" },
            { icon: "💰", title: "Top Earner", desc: "₦10k+ in a day", earned: "This week" },
            { icon: "⭐", title: "5-Star Pro", desc: "20 consecutive 5★ ratings", earned: "2 days ago" },
            { icon: "📦", title: "Delivery Master", desc: "50 deliveries completed", earned: "This month" },
          ].map((achievement, index) => (
            <div key={index} className="text-center p-4 bg-cream rounded-xl border border-mustard/20">
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-bold text-dark">{achievement.title}</h4>
              <p className="text-dark/70 text-sm mb-2">{achievement.desc}</p>
              <span className="text-green text-xs font-medium">Earned {achievement.earned}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-mustard to-dark rounded-2xl p-6 text-cream"
      >
        <h3 className="text-xl font-bold mb-4">💡 Performance Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-3">
            <span className="text-green">✓</span>
            <span>Your on-time rate is excellent! Keep it up</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green">✓</span>
            <span>Try accepting more deliveries during peak hours (12pm-2pm)</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-yellow-400">💡</span>
            <span>Consider the Ihiagwa route for faster deliveries</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, change, icon, color }) {
  const isPositive = change.startsWith('+');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${color} text-cream rounded-2xl p-6 shadow-lg`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-cream/80 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`mt-3 text-sm ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
        {change} from last period
      </div>
    </motion.div>
  );
}