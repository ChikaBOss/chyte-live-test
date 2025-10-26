"use client";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <h2 className="text-lg font-semibold">
                Customer: {order.customerName}
              </h2>
              <ul className="mt-2 space-y-1">
                {order.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-gray-700"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₦{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-bold text-green-600">
                Total: ₦{order.total}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}