"use client";
import { useState, useEffect } from "react";
import { DeliveryCard } from "@/components/RiderDashboard/DeliveryCard";

export default function HistoryPage() {
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/rider/orders?status=completed");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCompletedDeliveries(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-dark mb-6">Delivery History</h1>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-dark/30 border-t-dark rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Delivery History</h1>

      <div className="grid gap-4">
        {completedDeliveries.map((delivery) => (
          <DeliveryCard
            key={delivery._id}
            delivery={delivery}
            onStatusChange={() => {}} // No status changes in history
            readOnly
          />
        ))}
      </div>

      {completedDeliveries.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-dark/60">No delivery history yet</p>
        </div>
      )}
    </div>
  );
}