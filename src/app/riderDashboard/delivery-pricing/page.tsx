"use client";

import { useState, useEffect } from 'react';
import { useDeliveryPricing } from '@/hooks/useDeliveryPricing';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const { pricing, loading, error, refresh } = useDeliveryPricing();
  
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingFormData | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Only block if not logged in
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push('/login'); // change if your login route is different
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <p className="text-dark font-medium">Checking session...</p>
      </div>
    );
  }

  const handleEdit = (location: string) => {
    const locationPricing = pricing.find(p => p.baseLocation === location);
    if (locationPricing) {
      setEditingLocation(location);
      setFormData({
        baseLocation: locationPricing.baseLocation,
        deliveryAreas: [...locationPricing.deliveryAreas]
      });
    }
  };

  const handleAddArea = () => {
    if (formData) {
      setFormData({
        ...formData,
        deliveryAreas: [...formData.deliveryAreas, { area: '', price: 0 }]
      });
    }
  };

  const handleRemoveArea = (index: number) => {
    if (formData && formData.deliveryAreas.length > 1) {
      const newAreas = formData.deliveryAreas.filter((_, i) => i !== index);
      setFormData({ ...formData, deliveryAreas: newAreas });
    }
  };

  const handleAreaChange = (index: number, field: 'area' | 'price', value: string | number) => {
    if (formData) {
      const newAreas = [...formData.deliveryAreas];
      newAreas[index] = { ...newAreas[index], [field]: value };
      setFormData({ ...formData, deliveryAreas: newAreas });
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setSaveLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/delivery-pricing/${encodeURIComponent(formData.baseLocation)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update pricing');
      }
      
      setMessage({ type: 'success', text: 'Delivery pricing updated successfully!' });
      setEditingLocation(null);
      setFormData(null);
      refresh();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingLocation(null);
    setFormData(null);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <p className="text-dark font-medium">Loading delivery pricing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-olive-2 mb-6">Delivery Pricing Management</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.map((location) => (
            <div key={location.baseLocation} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-olive-2">{location.baseLocation}</h2>
                <button
                  onClick={() => handleEdit(location.baseLocation)}
                  className="px-4 py-2 bg-mustard text-white rounded-lg"
                >
                  Edit
                </button>
              </div>

              {location.deliveryAreas.map((area, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span>{area.area}</span>
                  <span>₦{area.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {editingLocation && formData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-xl">
              <h2 className="text-xl font-bold mb-4">
                Edit Pricing for {formData.baseLocation}
              </h2>

              {formData.deliveryAreas.map((area, index) => (
                <div key={index} className="flex gap-3 mb-3">
                  <input
                    value={area.area}
                    onChange={(e) => handleAreaChange(index, 'area', e.target.value)}
                    className="border p-2 flex-1"
                  />
                  <input
                    type="number"
                    value={area.price}
                    onChange={(e) => handleAreaChange(index, 'price', Number(e.target.value))}
                    className="border p-2 w-28"
                  />
                  <button
                    onClick={() => handleRemoveArea(index)}
                    className="text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex justify-between mt-4">
                <button onClick={handleAddArea} className="px-3 py-2 bg-gray-200 rounded">
                  + Add Area
                </button>

                <div className="flex gap-3">
                  <button onClick={handleCancel} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="px-4 py-2 bg-mustard text-white rounded"
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}