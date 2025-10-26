"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "Sarah's Handcrafted Goods",
    email: "sarah@handcrafted.com",
    phone: "+234 812 345 6789",
    description: "Handmade artisan products with love and care",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sales: true,
    newOrders: true,
    lowStock: true,
    promotions: false,
  });

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-dark">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account settings and preferences</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:w-1/4"
        >
          <div className="bg-white rounded-xl shadow-lg p-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${activeTab === "profile" ? "bg-olive text-cream" : "text-dark hover:bg-cream"}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${activeTab === "notifications" ? "bg-olive text-cream" : "text-dark hover:bg-cream"}`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${activeTab === "security" ? "bg-olive text-cream" : "text-dark hover:bg-cream"}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${activeTab === "payment" ? "bg-olive text-cream" : "text-dark hover:bg-cream"}`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === "shipping" ? "bg-olive text-cream" : "text-dark hover:bg-cream"}`}
            >
              Shipping
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:w-3/4"
        >
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Store Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Store Description</label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => setProfile({...profile, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  />
                </div>
                <div className="pt-4">
                  <button className="bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-dark">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => setNotifications({...notifications, email: !notifications.email})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-dark">New Sales</p>
                    <p className="text-sm text-gray-500">Get notified when you make a sale</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.sales}
                      onChange={() => setNotifications({...notifications, sales: !notifications.sales})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-dark">New Orders</p>
                    <p className="text-sm text-gray-500">Get notified when you receive a new order</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.newOrders}
                      onChange={() => setNotifications({...notifications, newOrders: !notifications.newOrders})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-dark">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.lowStock}
                      onChange={() => setNotifications({...notifications, lowStock: !notifications.lowStock})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-dark">Promotions</p>
                    <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.promotions}
                      onChange={() => setNotifications({...notifications, promotions: !notifications.promotions})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive"></div>
                  </label>
                </div>
                <div className="pt-4">
                  <button className="bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-dark mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                      />
                    </div>
                    <button className="bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-dark mb-4">Two-Factor Authentication</h3>
                  <p className="text-gray-500 mb-4">Add an extra layer of security to your account</p>
                  <button className="bg-cream text-dark px-4 py-2 rounded-lg font-medium border border-olive hover:bg-cream/80 transition">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add other tabs content here */}
          {activeTab !== "profile" && activeTab !== "notifications" && activeTab !== "security" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-6">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
              </h2>
              <p className="text-gray-500">This section is under development.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}