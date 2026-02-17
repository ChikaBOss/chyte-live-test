"use client";
import { useState, useEffect } from "react";
import { DeliveryCard } from "@/components/RiderDashboard/DeliveryCard";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/delivery/jobs", { cache: "no-store" });
        const data = await res.json();
        setDeliveries(data);
      } catch (err) {
        console.error("Failed to fetch delivery jobs", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeliveries();
  }, []);

  // Function to remove a delivery from the list
  const handleDeleteDelivery = (deliveryId) => {
    setDeliveries(prev => prev.filter(d => d._id !== deliveryId));
  };

  // Function to update delivery status
  const handleStatusChange = (deliveryId, newStatus) => {
    setDeliveries(prev =>
      prev.map(d =>
        d._id === deliveryId
          ? { ...d, status: newStatus }
          : d
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-dark mb-6">Active Deliveries</h1>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-dark/30 border-t-dark rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Active Deliveries</h1>
        <div className="text-sm text-dark/70">
          {deliveries.length} {deliveries.length === 1 ? "request" : "requests"}
        </div>
      </div>

      <div className="grid gap-4">
        {deliveries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-dark mb-2">No Delivery Requests</h3>
            <p className="text-dark/60">When customers request delivery, they will appear here.</p>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery._id}
              delivery={delivery}
              onStatusChange={(newStatus) => handleStatusChange(delivery._id, newStatus)}
              onDelete={(deliveryId) => handleDeleteDelivery(deliveryId)}
            />
          ))
        )}
      </div>
    </div>
  );
}