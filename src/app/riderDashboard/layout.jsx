"use client";
import { useState } from "react";
import { RiderSidebar } from "@/components/RiderDashboard/RiderSidebar";
import { RiderHeader } from "@/components/RiderDashboard/RiderHeader";

export default function RiderDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FCFBF1]">
      <RiderSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <RiderHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}