"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const hasFetched = useRef(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle: "Motorcycle",
  });

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    rating: 0,
  });

  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

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

        setStats({
          totalDeliveries: data.stats?.totalDeliveries || 0,
          totalEarnings: data.stats?.totalEarnings || 0,
          rating: data.stats?.rating || 0,
        });

        setIsActive(data.isActive ?? true);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      await update();
    } catch (err: any) {
      setMessage(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rider Profile</h1>

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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green">{stats.totalDeliveries}</div>
            <div className="text-sm text-gray-600">Total Deliveries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green">
              ₦{stats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green">{stats.rating}</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>
      </div>

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