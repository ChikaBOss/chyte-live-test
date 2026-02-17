import { useState, useEffect } from 'react';

export interface DeliveryArea {
  area: string;
  price: number;
}

export interface DeliveryPricing {
  baseLocation: string;
  deliveryAreas: DeliveryArea[];
}

export function useDeliveryPricing(baseLocation?: string) {
  const [pricing, setPricing] = useState<DeliveryPricing[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<DeliveryPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all pricing
  const fetchAllPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/delivery-pricing');
      if (!res.ok) throw new Error('Failed to fetch delivery pricing');
      const data = await res.json();
      setPricing(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific pricing by base location
  const fetchPricingByLocation = async (location: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/delivery-pricing/${encodeURIComponent(location)}`);
      if (!res.ok) throw new Error('Failed to fetch delivery pricing');
      const data = await res.json();
      setSelectedPricing(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate delivery fee
  const normalize = (text: string) =>
    text.toLowerCase().replace(/[\s_]+/g, '');
  
  const calculateDeliveryFee = (
    vendorLocation: string,
    deliveryArea: string
  ): number => {
    const locationPricing = pricing.find(
      p => normalize(p.baseLocation) === normalize(vendorLocation)
    );
  
    if (!locationPricing) return 0;
  
    const area = locationPricing.deliveryAreas.find(a =>
      normalize(a.area) === normalize(deliveryArea)
    );
  
    return area ? area.price : 0;
  };

  // Get available delivery areas for a base location
  const getDeliveryAreas = (location: string): DeliveryArea[] => {
    const locationPricing = pricing.find(p => p.baseLocation === location);
    return locationPricing?.deliveryAreas || [];
  };

  useEffect(() => {
    fetchAllPricing();
  }, []);

  useEffect(() => {
    if (baseLocation) {
      fetchPricingByLocation(baseLocation);
    }
  }, [baseLocation]);

  return {
    pricing,
    selectedPricing,
    loading,
    error,
    calculateDeliveryFee,
    getDeliveryAreas,
    refresh: fetchAllPricing
  };
}