"use client";
import { useState, useEffect } from "react";
import { DeliveryCard } from "@/components/RiderDashboard/DeliveryCard";

export default function HistoryPage() {
  const [completedDeliveries, setCompletedDeliveries] = useState([]);

  useEffect(() => {
    // Dummy completed deliveries
    const dummyData = [
      { 
        id: 3, 
        customer: "Mike Tyson", 
        phone: "+234 803 456 7890",
        pickup: "FUTO Gate", 
        dropoff: "Ihiagwa", 
        price: 1200, 
        status: "completed",
        items: [
          { name: "Fried Rice", quantity: 1 }
        ],
        completedAt: "2024-01-15T14:30:00Z"
      }
    ];
    setCompletedDeliveries(dummyData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery History</h1>
      
      <div className="grid gap-4">
        {completedDeliveries.map(delivery => (
          <DeliveryCard 
            key={delivery.id} 
            delivery={delivery}
            onStatusChange={() => {}} // No status changes in history
          />
        ))}
      </div>

      {completedDeliveries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No delivery history yet
        </div>
      )}
    </div>
  );
}