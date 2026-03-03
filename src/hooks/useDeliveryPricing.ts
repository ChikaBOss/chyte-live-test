import { useState, useEffect } from "react";

type DeliveryArea = {
  area: string;
  price: number;
};

type LocationPricing = {
  baseLocation: string;
  deliveryAreas: DeliveryArea[];
};

export function useDeliveryPricing(
  companyId?: string,
  requireCompanyId: boolean = false
) {
  const [pricing, setPricing] = useState<LocationPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);

      const url = companyId
        ? `/api/delivery-pricing?companyId=${companyId}`
        : "/api/delivery-pricing";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch pricing");

      const data: LocationPricing[] = await res.json();

      setPricing(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requireCompanyId && !companyId) {
      setLoading(true);
      return;
    }

    fetchPricing();
  }, [companyId, requireCompanyId]);

  const calculateDeliveryFee = (
    vendorLocation: string,
    deliveryArea: string
  ): number => {
    const locationPricing = pricing.find(
      (p) => p.baseLocation === vendorLocation
    );

    if (!locationPricing) return 0;

    const areaPricing = locationPricing.deliveryAreas.find(
      (a) => a.area === deliveryArea
    );

    return areaPricing?.price || 0;
  };

  return {
    pricing,
    loading,
    error,
    refresh: fetchPricing,
    calculateDeliveryFee,
  };
}