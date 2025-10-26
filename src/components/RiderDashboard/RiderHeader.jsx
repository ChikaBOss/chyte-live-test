"use client";
import { useState } from "react";

export function RiderHeader({ onMenuClick }) {
  const [notifications, setNotifications] = useState(3); // dummy notification count

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        {/* Left: Menu Button (Mobile) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center: Welcome Message */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-lg font-semibold text-gray-900">Welcome back, John! 👋</h1>
          <p className="text-sm text-gray-600">Ready to deliver some smiles today?</p>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2.47 2.47a.75.75 0 0 0 .53 1.28h15.88a.75.75 0 0 0 .53-1.28L16.5 12V9.75a6 6 0 0 0-6-6z" />
            </svg>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#788D7C] rounded-full flex items-center justify-center text-white font-semibold">
              J
            </div>
            <span className="hidden lg:block text-sm font-medium">John Rider</span>
          </div>
        </div>
      </div>
    </header>
  );
}