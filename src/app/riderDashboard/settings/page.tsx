"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Personal info
  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle: "Motorcycle",
  });

  // Email (separate because it might need verification)
  const [email, setEmail] = useState("");

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Status
  const [isActive, setIsActive] = useState(true);

  // Fetch current data
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/rider/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          vehicle: data.vehicle || "Motorcycle",
        });
        setEmail(data.email || "");
        setIsActive(data.isActive ?? true);
      } catch (err: any) {
        console.error("Failed to fetch settings:", err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session?.user?.id, status, router]);

  // Update personal info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/rider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Profile updated successfully!");
      await update(); // refresh session
    } catch (err: any) {
      setMessage(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/rider/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage(err.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  // Toggle online status
  const handleToggleStatus = async () => {
    try {
      const res = await fetch("/api/rider/toggle-active", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsActive(data.isActive);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-dark/30 border-t-dark rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Personal Information */}
      <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green"
            >
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 px-6 py-2 bg-dark text-cream rounded-lg font-medium hover:bg-green transition-colors disabled:bg-dark/50"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>

      {/* Email (read‑only for now) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Email Address</h2>
        <p className="text-gray-700 mb-2">{email}</p>
        <p className="text-sm text-gray-500">
          To change your email, please contact support. (Future: verify with OTP)
        </p>
      </div>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 px-6 py-2 bg-dark text-cream rounded-lg font-medium hover:bg-green transition-colors disabled:bg-dark/50"
        >
          {saving ? "Changing..." : "Change Password"}
        </button>
      </form>

      {/* Online Status Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Online Status</h3>
            <p className="text-sm text-gray-600">
              Go offline to stop receiving delivery requests
            </p>
          </div>
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? "bg-green text-white hover:bg-green/90"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {isActive ? "Online 🟢" : "Offline 🔴"}
          </button>
        </div>
      </div>
    </div>
  );
}