"use client";
import { useState, useEffect } from "react";
import { DeliveryCard } from "@/components/RiderDashboard/DeliveryCard";

export default function RiderDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    completedToday: 0,
    activeDeliveries: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    // Dummy data
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
      },
      { 
        id: 2, 
        customer: "Ada Johnson", 
        phone: "+234 802 345 6789",
        pickup: "School Park", 
        dropoff: "Obinze Market", 
        price: 1000, 
        status: "ongoing",
        items: [
          { name: "Chicken Burger", quantity: 1 }
        ]
      }
    ];

    setDeliveries(dummyData);
    setStats({
      todayEarnings: 3500,
      completedToday: 5,
      activeDeliveries: 3,
      totalEarnings: 67500
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Rider Dashboard</h1>
        <p className="text-dark/70">Welcome back! Ready to deliver some smiles today? 😊</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Today's Earnings</p>
          <p className="text-2xl font-bold text-green">₦{stats.todayEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Completed Today</p>
          <p className="text-2xl font-bold text-olive">{stats.completedToday}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Active Deliveries</p>
          <p className="text-2xl font-bold text-mustard">{stats.activeDeliveries}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
          <p className="text-dark/70 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-dark">₦{stats.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-mustard/20">
        <h2 className="text-xl font-bold text-dark mb-4">Active Deliveries</h2>
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
        
        {deliveries.length === 0 && (
          <div className="text-center py-8 text-dark/50">
            No active deliveries at the moment
          </div>
        )}
      </div>
    </div>
  );
}