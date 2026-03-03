"use client";

import { useState, useEffect } from "react";
import { useDeliveryPricing } from "@/hooks/useDeliveryPricing";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PricingFormData {
  baseLocation: string;
  deliveryAreas: Array<{
    area: string;
    price: number;
  }>;
}

export default function DeliveryPricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const companyId = session?.user?.id;

  // Pass requireCompanyId = true so hook waits for companyId
  const { pricing, loading, error, refresh } = useDeliveryPricing(companyId, true);

  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingFormData | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // Show loading while session or pricing is loading
  if (status === "loading" || loading || (session && !companyId)) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mustard border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-dark font-medium">Loading your pricing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error loading pricing</div>
          <p className="text-dark/70 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-6 py-2 bg-dark text-cream rounded-lg hover:bg-green transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pricingList: any[] = Array.isArray(pricing) ? pricing : [];

  const handleEdit = (location: string) => {
    const locationPricing = pricingList.find(
      (p) => p.baseLocation === location
    ) as any;
  
    if (locationPricing) {
      setEditingLocation(location);
      setFormData({
        baseLocation: locationPricing.baseLocation,
        deliveryAreas: [...locationPricing.deliveryAreas],
      });
    }
  };
  const handleAddArea = () => {
    if (formData) {
      setFormData({
        ...formData,
        deliveryAreas: [...formData.deliveryAreas, { area: "", price: 0 }],
      });
    }
  };

  const handleRemoveArea = (index: number) => {
    if (formData && formData.deliveryAreas.length > 1) {
      const newAreas = formData.deliveryAreas.filter((_, i) => i !== index);
      setFormData({ ...formData, deliveryAreas: newAreas });
    }
  };

  const handleAreaChange = (index: number, field: "area" | "price", value: string | number) => {
    if (formData) {
      const newAreas = [...formData.deliveryAreas];
      newAreas[index] = { ...newAreas[index], [field]: value };
      setFormData({ ...formData, deliveryAreas: newAreas });
    }
  };

  const handleSave = async () => {
    if (!formData || !companyId) return;

    setSaveLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/delivery-pricing/${encodeURIComponent(formData.baseLocation)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update pricing");
      }

      setMessage({ type: "success", text: "Delivery pricing updated successfully!" });
      setEditingLocation(null);
      setFormData(null);
      refresh();

      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingLocation(null);
    setFormData(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-olive-2 mb-6">Your Delivery Pricing</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {pricingList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-dark mb-2">No Pricing Configured</h2>
            <p className="text-dark/70 mb-6">
              You haven't set up your delivery pricing yet. Please contact the admin to initialize your pricing.
            </p>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-dark text-cream rounded-lg hover:bg-green transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingList.map((location: any) => (
              <div key={location.baseLocation} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-olive-2">{location.baseLocation}</h2>
                  <button
                    onClick={() => handleEdit(location.baseLocation)}
                    className="px-4 py-2 bg-mustard text-white rounded-lg hover:bg-mustard/90 transition-colors"
                  >
                    Edit
                  </button>
                </div>

                {location.deliveryAreas.map((area: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b border-dark/10 last:border-0">
                    <span className="text-dark/80">{area.area}</span>
                    <span className="font-semibold text-green">₦{area.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {editingLocation && formData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Pricing for {formData.baseLocation}</h2>

              <div className="space-y-4">
                {formData.deliveryAreas.map((area, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        value={area.area}
                        onChange={(e) => handleAreaChange(index, "area", e.target.value)}
                        className="w-full border border-dark/20 rounded-lg p-2 focus:ring-2 focus:ring-green focus:border-transparent"
                        placeholder="Area name"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        value={area.price}
                        onChange={(e) => handleAreaChange(index, "price", Number(e.target.value))}
                        className="w-full border border-dark/20 rounded-lg p-2 focus:ring-2 focus:ring-green focus:border-transparent"
                        placeholder="Price"
                        min="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove area"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddArea}
                  className="flex items-center gap-2 text-green hover:text-green/80 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Area
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark/10">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-dark/20 rounded-lg text-dark hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-green text-white rounded-lg font-medium hover:bg-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}