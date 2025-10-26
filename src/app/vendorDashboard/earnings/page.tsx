"use client";

import React, { useState, useMemo } from "react";
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

type Sale = {
  date: string; // YYYY-MM-DD
  amount: number;
};

const dummySales: Sale[] = [
  { date: "2025-08-01", amount: 5000 },
  { date: "2025-08-02", amount: 7000 },
  { date: "2025-08-03", amount: 2000 },
  { date: "2025-08-04", amount: 9000 },
  { date: "2025-08-05", amount: 4000 },
  { date: "2025-08-06", amount: 10000 },
  { date: "2025-08-07", amount: 3000 },
];

const getFilteredData = (sales: Sale[], filter: string) => {
  const today = new Date();
  if (filter === "Today") {
    return sales.filter(
      (sale) => sale.date === today.toISOString().split("T")[0]
    );
  }
  if (filter === "This Week") {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return sales.filter((sale) => new Date(sale.date) >= startOfWeek);
  }
  if (filter === "This Month") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return sales.filter((sale) => new Date(sale.date) >= startOfMonth);
  }
  return sales;
};

export default function Earnings() {
  const [filter, setFilter] = useState<"Today" | "This Week" | "This Month">(
    "This Month"
  );

  const filteredSales = useMemo(
    () => getFilteredData(dummySales, filter),
    [filter]
  );

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const adminCommission = totalSales * 0.07;
  const vendorNet = totalSales - adminCommission;

  const chartData = {
    labels: filteredSales.map((sale) => sale.date),
    datasets: [
      {
        label: "Sales",
        data: filteredSales.map((sale) => sale.amount),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Earnings Overview</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {["Today", "This Week", "This Month"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded ${
              filter === f
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">Total Sales</h2>
          <p className="text-2xl font-bold">₦{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">Vendor Net Earnings</h2>
          <p className="text-2xl font-bold">₦{vendorNet.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">Admin Commission (7%)</h2>
          <p className="text-2xl font-bold">₦{adminCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
        <Line data={chartData} />
      </div>
    </div>
  );
}