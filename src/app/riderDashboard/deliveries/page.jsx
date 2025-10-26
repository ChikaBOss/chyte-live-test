"use client";
import { useState, useEffect } from "react";
import { DeliveryCard } from "@/components/RiderDashboard/DeliveryCard";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const dummyData = [
      { 
        id: 1, 
        customer: "John Doe", 
        phone: "+234 801 234 5678",
        pickup: "FUTO South Gate", 
        dropoff: "Ihiagwa Campus", 
        price: 1500, 
        status: "pending",
        items: [
          { name: "Pepperoni Pizza", quantity: 1 },
          { name: "Coca Cola", quantity: 2 }
        ]
      }
    ];
    setDeliveries(dummyData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-6">Active Deliveries</h1>
      <div className="grid gap-4">
        {deliveries.map(delivery => (
          <DeliveryCard 
            key={delivery.id} 
            delivery={delivery}
            onStatusChange={(newStatus) => {
              setDeliveries(prev => prev.map(d => 
                d.id === delivery.id ? { ...d, status: newStatus } : d
              ));
            }}
          />
        ))}
      </div>
    </div>
  );
}