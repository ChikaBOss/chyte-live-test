"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = { name: string; qty: number; price: number };
type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number; // timestamp
};

const STATUS_OPTIONS: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");

  // Seed demo data if empty
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pharmacyOrders") || "[]") as Order[];
    if (saved.length === 0) {
      const seed: Order[] = [
        {
          id: "o_" + Date.now(),
          customerName: "Chidi Okeke",
          items: [
            { name: "Paracetamol 500mg", qty: 2, price: 250 },
            { name: "Vitamin C", qty: 1, price: 500 },
          ],
          total: 250 * 2 + 500,
          status: "pending",
          createdAt: Date.now(),
        },
        {
          id: "o_" + (Date.now() - 86400000),
          customerName: "Amara Obi",
          items: [{ name: "Cough Syrup", qty: 1, price: 1800 }],
          total: 1800,
          status: "completed",
          createdAt: Date.now() - 86400000,
        },
      ];
      localStorage.setItem("pharmacyOrders", JSON.stringify(seed));
      setOrders(seed);
    } else {
      setOrders(saved);
    }
  }, []);

  const persist = (next: Order[]) => {
    setOrders(next);
    localStorage.setItem("pharmacyOrders", JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const byStatus = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);
    if (!q.trim()) return byStatus;
    const qq = q.toLowerCase();
    return byStatus.filter(o =>
      o.customerName.toLowerCase().includes(qq) ||
      o.items.some(it => it.name.toLowerCase().includes(qq))
    );
  }, [orders, statusFilter, q]);

  const countsByStatus = useMemo(() => {
    const map: Record<OrderStatus, number> = { pending:0, preparing:0, ready:0, completed:0, cancelled:0 };
    orders.forEach(o => { map[o.status]++; });
    return map;
  }, [orders]);

  function updateStatus(id: string, status: OrderStatus) {
    persist(orders.map(o => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div className="space-y-6">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-gray-600">Manage incoming prescriptions & product orders.</p>
        </div>

        <div className="flex gap-3">
          <input
            className="border rounded px-3 py-2 w-60"
            placeholder="Search name or item…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map(s => (
          <div key={s} className="bg-white rounded shadow p-4">
            <p className="text-xs uppercase text-gray-500">{s}</p>
            <p className="text-2xl font-bold">{countsByStatus[s]}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total (₦)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Placed</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No orders.</td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="py-3 px-4 font-mono">{o.id.slice(0,8)}</td>
                <td className="py-3 px-4">{o.customerName}</td>
                <td className="py-3 px-4">
                  <ul className="text-gray-600">
                    {o.items.map((it, idx) => (
                      <li key={idx}>• {it.name} × {it.qty}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 px-4 font-semibold">₦{o.total.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="inline-block rounded px-2 py-1 text-xs bg-gray-100 capitalize">
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(o.id, s)}
                        className={`text-xs px-2 py-1 rounded border
                          ${o.status === s ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-100"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}