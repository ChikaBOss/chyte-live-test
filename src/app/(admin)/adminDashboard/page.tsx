'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Stats = {
  totalUsers: Record<string, number>;
  approvedUsers: Record<string, number>;
  pendingApprovals: {
    chefs: number;
    vendors: number;
    pharmacies: number;
    topVendors: number;
    total: number;
    recent: any[];
  };
  revenue: {
    total: number;
    last7Days: { date: string; amount: number }[];
  };
  payouts: {
    pendingCount: number;
    pendingTotal: number;
    recent: any[];
  };
  recentOrders: any[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-600 bg-gray-50 min-h-screen">
        <p>{error || 'Failed to load dashboard'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.revenue.last7Days.map(d => d.amount), 1);

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm md:text-base">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={Object.values(stats.totalUsers).reduce((a, b) => a + b, 0)}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals.total}
          icon="⏳"
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₦${stats.revenue.total.toLocaleString()}`}
          icon="💰"
          color="bg-green-500"
        />
        <StatCard
          title="Pending Payouts"
          value={`₦${stats.payouts.pendingTotal.toLocaleString()}`}
          subtitle={`${stats.payouts.pendingCount} requests`}
          icon="💸"
          color="bg-purple-500"
        />
      </div>

      {/* Users by Role – now includes Riders */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <RoleCard role="Chefs" total={stats.totalUsers.chefs} approved={stats.approvedUsers.chefs} color="blue" />
        <RoleCard role="Vendors" total={stats.totalUsers.vendors} approved={stats.approvedUsers.vendors} color="green" />
        <RoleCard role="Pharmacies" total={stats.totalUsers.pharmacies} approved={stats.approvedUsers.pharmacies} color="purple" />
        <RoleCard role="Top Vendors" total={stats.totalUsers.topVendors} approved={stats.approvedUsers.topVendors} color="yellow" />
        <RoleCard role="Riders" total={stats.totalUsers.riders ?? 0} approved={stats.approvedUsers.riders ?? 0} color="orange" />
      </div>

      {/* Revenue Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue (Last 7 Days)</h3>
          <div className="flex items-end h-40 gap-2">
            {stats.revenue.last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t"
                  style={{ height: `${(day.amount / maxRevenue) * 100 || 4}px` }}
                />
                <span className="text-xs text-gray-600 mt-2">{day.date}</span>
                <span className="text-xs font-medium">₦{day.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              href="/adminDashboard/approvals"
              label="Review Pending Approvals"
              count={stats.pendingApprovals.total}
              color="yellow"
            />
            <QuickAction
              href="/adminDashboard/payouts"
              label="Process Payouts"
              count={stats.payouts.pendingCount}
              color="purple"
            />
            <QuickAction
              href="/adminDashboard/orders"
              label="View Recent Orders"
              count={stats.recentOrders.length}
              color="blue"
            />
            <QuickAction
              href="/adminDashboard/settings"
              label="Platform Settings"
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* Recent Pending Applications */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Pending Applications</h3>
          <Link href="/adminDashboard/approvals" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.pendingApprovals.recent.length > 0 ? (
                stats.pendingApprovals.recent.map((app: any) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.businessName || app.pharmacyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.ownerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full 
                        ${app.role === 'chef' ? 'bg-blue-100 text-blue-800' : ''}
                        ${app.role === 'vendor' ? 'bg-green-100 text-green-800' : ''}
                        ${app.role === 'pharmacy' ? 'bg-purple-100 text-purple-800' : ''}
                        ${app.role === 'topvendor' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {app.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href="/adminDashboard/approvals"
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No pending applications. All clear!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders & Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Paid Orders</h3>
            <Link href="/adminDashboard/orders" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₦{order.commission.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payout Requests */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Pending Payout Requests</h3>
            <Link href="/adminDashboard/payouts" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.payouts.recent.length > 0 ? (
                  stats.payouts.recent.map((w: any) => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{w.user?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{w.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{w.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No pending payouts</td>
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

// Helper components (unchanged)
function StatCard({ title, value, subtitle, icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-full ${color} bg-opacity-10 flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </motion.div>
  );
}

function RoleCard({ role, total, approved, color }: any) {
  const pending = total - approved;
  const percent = total > 0 ? Math.round((approved / total) * 100) : 0;
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <p className="text-sm font-medium text-gray-500 mb-1">{role}</p>
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-bold text-gray-800">{total}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${color}-100 text-${color}-800`}>
          {pending} pending
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full bg-${color}-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ href, label, count, color }: any) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
    >
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-1 text-xs font-bold rounded-full bg-${color}-100 text-${color}-800`}>
          {count}
        </span>
      )}
    </Link>
  );
}