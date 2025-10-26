"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  customer: string;
  total: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: number; // ms
};

const ADMIN_RATE = 0.07;

export default function VendorOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vendorOrders") || "[]");
    setOrders(saved);
  }, []);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const today = orders.filter(o => o.createdAt >= todayStart.getTime());

  const revenueTotal   = orders.filter(o=>o.status==="completed")
                               .reduce((s,o)=>s+o.total,0);
  const adminCut       = Math.round(revenueTotal * ADMIN_RATE);
  const netToVendor    = revenueTotal - adminCut;
  const todayRevenue   = today.filter(o=>o.status==="completed").reduce((s,o)=>s+o.total,0);
  const activeOrders   = orders.filter(o=>["pending","preparing","ready"].includes(o.status)).length;

  // tiny 7-day revenue buckets
  const last7 = useMemo(() => {
    const buckets: { label: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      const amount = orders
        .filter(o => o.status==="completed" && o.createdAt>=start && o.createdAt<end)
        .reduce((s,o)=>s+o.total,0);
      buckets.push({ label: `${d.getMonth()+1}/${d.getDate()}`, amount });
    }
    return buckets;
  }, [orders]);
  const maxAmt = Math.max(...last7.map(b=>b.amount), 1);

  const recent = [...orders].sort((a,b)=>b.createdAt-a.createdAt).slice(0,6);

  return (
    <div className="space-y-6">
      {/* Header + quick actions */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-gray-600">Snapshot of your restaurant performance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/vendorDashboard/menu" className="px-4 py-2 rounded bg-dark text-cream hover:bg-green transition">
            Add Menu Item
          </Link>
          <Link href="/vendorDashboard/orders" className="px-4 py-2 rounded border hover:bg-gray-100">
            View Orders
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold">₦{revenueTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Admin 7%: ₦{adminCut.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Net to You</p>
          <p className="text-3xl font-bold text-green-600">₦{netToVendor.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Today’s Revenue</p>
          <p className="text-3xl font-bold">₦{todayRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Active Orders</p>
          <p className="text-3xl font-bold">{activeOrders}</p>
        </div>
      </div>

      {/* Last 7 days sparkline */}
      <div className="bg-white rounded shadow p-5">
        <p className="font-semibold mb-3">Revenue (Last 7 days)</p>
        <div className="flex items-end gap-2 h-36">
          {last7.map((b,i)=>(
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-8 bg-green-600 rounded"
                style={{ height: `${(b.amount / maxAmt) * 100 || 2}%` }}
                title={`₦${b.amount.toLocaleString()}`}
              />
              <span className="text-xs text-gray-600">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-5 border-b">
          <p className="font-semibold">Recent Orders</p>
        </div>
        <div className="divide-y">
          {recent.length === 0 ? (
            <p className="p-5 text-gray-500">No orders yet.</p>
          ) : recent.map(o=>(
            <div key={o.id} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">#{o.id}</p>
                <p className="text-sm text-gray-600">{o.customer}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₦{o.total.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500">{o.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}