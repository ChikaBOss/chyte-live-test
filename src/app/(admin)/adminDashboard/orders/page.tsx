"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/* ================== TYPES ================== */

type Order = {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  vendorName: string;
  vendorType: "chef" | "vendor" | "pharmacy" | "topvendor";
  total: number;
  status: "pending" | "paid" | "delivered" | "cancelled";
  createdAt: string;
};

type PaginatedResponse = {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/* ================== INNER COMPONENT ================== */

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const statusFilter = searchParams.get("status") || "";
  const vendorSearch = searchParams.get("vendor") || "";

  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(statusFilter && { status: statusFilter }),
          ...(vendorSearch && { vendor: vendorSearch }),
        });

        const res = await fetch(`/api/admin/orders?${params}`);
        const json = await res.json();

        if (res.ok) {
          setData(json);
        } else {
          setError(json.error || "Failed to fetch orders");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, limit, statusFilter, vendorSearch]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("status", e.target.value);
    else params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleVendorSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("vendorSearch") as string;

    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("vendor", search);
    else params.delete("vendor");
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-gray-50 min-h-screen">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <form onSubmit={handleVendorSearch} className="flex gap-2">
            <input
              name="vendorSearch"
              defaultValue={vendorSearch}
              placeholder="Vendor name..."
              className="px-4 py-2 border rounded-lg"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Search
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.length ? (
                data.orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      #{order.orderNumber ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customerEmail ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.vendorName ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {order.vendorType ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₦{order.total?.toLocaleString() ?? "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status ?? "unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/adminDashboard/orders/${order._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 flex justify-between items-center border-t">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === data.totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== PAGE EXPORT ================== */

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}