"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [rider, setRider] = useState({
    name: "John Rider",
    phone: "+234 800 123 4567",
    vehicle: "Motorcycle",
    status: "online"
  });

  const stats = {
    totalDeliveries: 45,
    totalEarnings: 67500,
    rating: 4.8
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rider Profile</h1>
      
      {/* Personal Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              value={rider.name}
              onChange={(e) => setRider({...rider, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input 
              type="tel" 
              value={rider.phone}
              onChange={(e) => setRider({...rider, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select 
              value={rider.vehicle}
              onChange={(e) => setRider({...rider, vehicle: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            >
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#788D7C]">{stats.totalDeliveries}</div>
            <div className="text-sm text-gray-600">Total Deliveries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#788D7C]">₦{stats.totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#788D7C]">{stats.rating}</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>
      </div>

      {/* Status Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Online Status</h3>
            <p className="text-sm text-gray-600">Go offline to stop receiving delivery requests</p>
          </div>
          <button 
            onClick={() => setRider({...rider, status: rider.status === 'online' ? 'offline' : 'online'})}
            className={`px-4 py-2 rounded-lg font-medium ${
              rider.status === 'online' 
                ? 'bg-[#788D7C] text-white' 
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {rider.status === 'online' ? 'Online 🟢' : 'Offline 🔴'}
          </button>
        </div>
      </div>
    </div>
  );
}