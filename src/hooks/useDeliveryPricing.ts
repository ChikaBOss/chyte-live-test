import { useState, useEffect } from 'react';

export function useDeliveryPricing(companyId?: string, requireCompanyId: boolean = false) {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const url = companyId
        ? `/api/delivery-pricing?companyId=${companyId}`
        : '/api/delivery-pricing';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch pricing');
      const data = await res.json();
      setPricing(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If companyId is required and not provided, wait (keep loading true)
    if (requireCompanyId && !companyId) {
      // Don't fetch, stay loading
      setLoading(true);
      return;
    }
    fetchPricing();
  }, [companyId, requireCompanyId]);

  const calculateDeliveryFee = (vendorLocation: string, deliveryArea: string): number => {
    const locationPricing = pricing.find((p: any) => p.baseLocation === vendorLocation);
    if (!locationPricing) return 0;
    const areaPricing = locationPricing.deliveryAreas.find((a: any) => a.area === deliveryArea);
    return areaPricing?.price || 0;
  };

  return { pricing, loading, error, refresh: fetchPricing, calculateDeliveryFee };
}