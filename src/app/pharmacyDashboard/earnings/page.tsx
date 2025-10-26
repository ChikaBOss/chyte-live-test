"use client";

import { useEffect, useMemo, useState } from "react";

// ✨ NEW: chart imports (same pattern as your vendor earnings)
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Order = {
  id: string;
  total: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: number;
};

type RangeKey = "today" | "7d" | "30d" | "all";

const ADMIN_RATE = 0.07;

export default function PharmacyEarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [range, setRange] = useState<RangeKey>("7d");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pharmacyOrders") || "[]") as Order[];
    setOrders(saved);
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const start =
      range === "today" ? new Date().setHours(0, 0, 0, 0)
      : range === "7d" ? now - 7 * 86400000
      : range === "30d" ? now - 30 * 86400000
      : 0;
    return orders.filter((o) => o.status === "completed" && o.createdAt >= start);
  }, [orders, range]);

  const gross = filtered.reduce((sum, o) => sum + o.total, 0);
  const admin = Math.round(gross * ADMIN_RATE);
  const net = gross - admin;

  // We already bucketed the "last 7 days" in your original version.
  // We'll reuse that to draw the Line chart (to match your vendor earnings look).
  const last7 = useMemo(() => {
    const buckets: { day: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      const amount = orders
        .filter((o) => o.status === "completed" && o.createdAt >= start && o.createdAt < end)
        .reduce((s, o) => s + o.total, 0);
      buckets.push({ day: label, amount });
    }
    return buckets;
  }, [orders]);

  function exportCsv() {
    const header = "OrderId,Total,CreatedAt\n";
    const rows = filtered
      .map((o) => `${o.id},${o.total},${new Date(o.createdAt).toISOString()}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pharmacy-earnings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ✨ NEW: chart data (mirrors your vendor earnings pattern)
  const chartData = {
    labels: last7.map((b) => b.day),
    datasets: [
      {
        label: "Sales",
        data: last7.map((b) => b.amount),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        pointRadius: 3,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true as const },
      title: { display: false as const, text: "" },
      tooltip: { mode: "index" as const, intersect: false },
    },
    interaction: { mode: "nearest" as const, intersect: false },
    scales: {
      y: {
        ticks: {
          callback: (val: any) => `₦${Number(val).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header & filter */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-gray-600">Admin commission is fixed at 7%.</p>
        </div>
        <div className="flex gap-2">
          {(["today", "7d", "30d", "all"] as RangeKey[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-2 rounded border text-sm capitalize
                ${range === r ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-100"}`}
            >
              {r}
            </button>
          ))}
          <button onClick={exportCsv} className="px-3 py-2 rounded border hover:bg-gray-100 text-sm">
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Gross sales</p>
          <p className="text-3xl font-bold">₦{gross.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Admin commission (7%)</p>
          <p className="text-3xl font-bold text-red-600">₦{admin.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded shadow p-5">
          <p className="text-xs uppercase text-gray-500">Net to pharmacy</p>
          <p className="text-3xl font-bold text-green-600">₦{net.toLocaleString()}</p>
        </div>
      </div>

      {/* ✨ REPLACED: Tiny bar chart → Line chart (matching vendor earnings look) */}
      <div className="bg-white rounded shadow p-5">
        <p className="mb-3 font-semibold">Last 7 days revenue</p>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}