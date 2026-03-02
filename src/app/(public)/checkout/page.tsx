"use client";

import React, { useState, forwardRef, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type MotionProps } from "framer-motion";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useDeliveryPricing } from "@/hooks/useDeliveryPricing";

type ButtonHTMLProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type MotionButtonProps = ButtonHTMLProps & MotionProps;
const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (props, ref) => <motion.button ref={ref} {...props} />
);
MotionButton.displayName = "MotionButton";

type DeliveryMethod = "SELF_PICKUP" | "SITE_COMPANY";
type CustomerLocation = "Eziobodo" | "Umuchima" | "Back gate";
type PaymentMethod = "CARD" | "COD";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");

  // Platform settings
  const [serviceFeePercentage, setServiceFeePercentage] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public-settings');
        const data = await res.json();
        if (data.success) {
          setServiceFeePercentage(data.settings.serviceFee);
        }
      } catch (err) {
        console.error('Failed to fetch platform settings', err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch active riders (companies)
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    fetch('/api/rider/active')
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        // Optionally select the first one by default
        if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCompanies(false));
  }, []);

  // Fix cart data
  const fixedCart = useMemo(() => {
    return cart.map(item => ({
      ...item,
      vendorName: item.vendorName || `Vendor-${item.vendorId || 'unknown'}`,
      vendorRole: item.vendorRole || 'vendor',
      vendorBaseLocation: item.vendorBaseLocation || 'Unknown Location',
      vendorId: item.vendorId || 'unknown-vendor-id'
    }));
  }, [cart]);

  const subtotal = useMemo(() => {
    return fixedCart.reduce((acc, item) => {
      const price = parseFloat(
        String(item.price).replace(/[^0-9.]/g, "")
      );
      const quantity = Number(item.quantity) || 0;
      return acc + (price || 0) * quantity;
    }, 0);
  }, [fixedCart]);

  // Delivery states
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("SELF_PICKUP");
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation>("Eziobodo");
  const [deliveryForm, setDeliveryForm] = useState({
    receiverName: "",
    receiverPhone: "",
    dropAddress: "",
    window: "ASAP",
    notes: "",
  });

  const normalizeVendorLocation = (location: string): string => {
    if (!location) return "Eziobodo";
    const lowerLoc = location.toLowerCase().trim();
    if (lowerLoc.includes("eziobodo") || lowerLoc === "eziobodo") return "Eziobodo";
    if (lowerLoc.includes("umuchima") || lowerLoc === "umuchima") return "Umuchima";
    if (lowerLoc.includes("back gate") || lowerLoc.includes("backgate") || lowerLoc.includes("back-gate")) return "Back gate";
    return "Eziobodo";
  };

  const vendorGroups = useMemo(() => {
    const map = new Map<
      string,
      { vendorId: string; vendorName: string; vendorRole: string; vendorLocation: string; items: any[]; rawLocation: string }
    >();
    fixedCart.forEach((item: any) => {
      const vendorId = item.vendorId || "single";
      const vendorName = item.vendorName || "Sellect All";
      const vendorRole = item.vendorRole || "vendor";
      const rawVendorLocation = item.vendorBaseLocation || "Eziobodo";
      const vendorLocation = normalizeVendorLocation(rawVendorLocation);
      if (!map.has(vendorId)) {
        map.set(vendorId, { 
          vendorId, 
          vendorName,
          vendorRole,
          vendorLocation, 
          rawLocation: rawVendorLocation,
          items: [] 
        });
      }
      map.get(vendorId)!.items.push(item);
    });
    return Array.from(map.values());
  }, [fixedCart]);

  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!mounted || fixedCart.length === 0) return;
    const init: Record<string, boolean> = {};
    fixedCart.forEach((i: any) => {
      init[i.id] = true;
    });
    setSelectedItems(init);
  }, [mounted, fixedCart]);

  const selectedVendors = useMemo(() => {
    return vendorGroups
      .filter(vendor => 
        vendor.items.some(item => selectedItems[item.id])
      )
      .map(vendor => vendor.vendorId);
  }, [vendorGroups, selectedItems]);

  const effectiveSelectedVendors = useMemo(() => {
    if (vendorGroups.length <= 1) {
      return [vendorGroups[0]?.vendorId ?? "single"];
    }
    return selectedVendors;
  }, [vendorGroups, selectedVendors]);

  // Use company-specific pricing
  const { 
    pricing: companyPricing = [],
    loading: pricingLoading,
    calculateDeliveryFee,
  } = useDeliveryPricing(selectedCompany || undefined);

  const [deliveryCalculated, setDeliveryCalculated] = useState(false);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<number>(0);
  const [deliveryAccepted, setDeliveryAccepted] = useState(false);

  // Calculate delivery fee using selected company's pricing
  const calculateFeeForVendor = useMemo(() => {
    return (vendorLocation: string, deliveryArea: string): number => {
      const normalizedVendorLocation = normalizeVendorLocation(vendorLocation);
      const locationPricing = companyPricing.find(
        (p: any) => p.baseLocation === normalizedVendorLocation
      );
      if (!locationPricing) return 0;
      const areaPricing = locationPricing.deliveryAreas.find(
        (a: any) => a.area === deliveryArea
      );
      return areaPricing?.price || 0;
    };
  }, [companyPricing]);

  useEffect(() => {
    if (deliveryMethod === "SITE_COMPANY" && companyPricing.length > 0 && deliveryCalculated) {
      let totalFee = 0;
      const selectedVendorGroups = vendorGroups.filter(v => 
        effectiveSelectedVendors.includes(v.vendorId)
      );
      selectedVendorGroups.forEach(vendor => {
        const fee = calculateFeeForVendor(vendor.vendorLocation, customerLocation);
        totalFee += fee;
      });
      setCalculatedDeliveryFee(totalFee);
    }
  }, [customerLocation, companyPricing, deliveryMethod, deliveryCalculated, vendorGroups, effectiveSelectedVendors, calculateFeeForVendor]);

  const selectedItemCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  const filteredSubtotal = useMemo(() => {
    return fixedCart
      .filter(item => selectedItems[item.id])
      .reduce((acc, item) => {
        const price = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
        const quantity = Number(item.quantity) || 0;
        return acc + (price || 0) * quantity;
      }, 0);
  }, [fixedCart, selectedItems]);

  const serviceFee = (filteredSubtotal * serviceFeePercentage) / 100;
  const filteredBaseTotal = filteredSubtotal + serviceFee;

  const deliveryAddOn = deliveryAccepted ? calculatedDeliveryFee : 0;
  const grandTotal = filteredBaseTotal + deliveryAddOn;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleItem = (itemId: string, vendorId: string, checked: boolean) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: checked }));
  };

  const toggleVendorAll = (vendorId: string, checked: boolean) => {
    const vendor = vendorGroups.find((v) => v.vendorId === vendorId);
    if (!vendor) return;
    setSelectedItems((prev) => {
      const next = { ...prev };
      vendor.items.forEach((it) => (next[it.id] = checked));
      return next;
    });
  };

  const handleCalculateDelivery = () => {
    if (!deliveryForm.receiverName.trim() || !deliveryForm.receiverPhone.trim() || !deliveryForm.dropAddress.trim()) {
      alert("Please fill in receiver name, phone, and address.");
      return;
    }
    if (selectedItemCount === 0) {
      alert("Please select at least one item for delivery.");
      return;
    }
    if (!selectedCompany) {
      alert("Please select a delivery company.");
      return;
    }
    if (companyPricing.length === 0) {
      alert("Selected company has no pricing configured.");
      return;
    }
    let totalFee = 0;
    const selectedVendorGroups = vendorGroups.filter(v => 
      effectiveSelectedVendors.includes(v.vendorId)
    );
    selectedVendorGroups.forEach(vendor => {
      const fee = calculateFeeForVendor(vendor.vendorLocation, customerLocation);
      totalFee += fee;
    });
    setCalculatedDeliveryFee(totalFee);
    setDeliveryCalculated(true);
  };

  const handlePaystackPayment = async () => {
    setError("");
    setIsProcessing(true);
    try {
      const allItems = fixedCart.map(item => ({
        productId: item.id,
        name: item.name,
        price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")),
        quantity: Number(item.quantity) || 1,
        vendorId: item.vendorId,
        vendorName: item.vendorName || "Unknown Vendor",
        vendorRole: item.vendorRole || "vendor",
        vendorBaseLocation: item.vendorBaseLocation || "Unknown",
      }));

      if (allItems.length === 0) throw new Error("Cart is empty");

      const orderDataToSend = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        },
        deliveryMethod: deliveryMethod,
        deliveryFee: deliveryAccepted ? calculatedDeliveryFee : 0,
        items: allItems,
        subtotal: allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        serviceFee: serviceFee,
        totalAmount: grandTotal,
        vendorGroups: vendorGroups.map(group => ({
          vendorId: group.vendorId,
          vendorName: group.vendorName,
          vendorRole: group.vendorRole,
          vendorLocation: group.vendorLocation,
          vendorBaseLocation: group.rawLocation,
          items: group.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")),
            quantity: Number(item.quantity) || 1,
          })),
          subtotal: group.items.reduce((sum, item) => 
            sum + (parseFloat(String(item.price).replace(/[^0-9.]/g, "")) * Number(item.quantity || 1)), 0
          ),
        })),
        selectedVendors: vendorGroups.map(g => g.vendorId),
        paymentMethod: 'CARD',
        selectedCompanyId: selectedCompany,
      };

      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDataToSend),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');
      const orderId = orderData.orderId;

      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          amount: Math.round(grandTotal * 100),
          orderId: orderId,
          userId: "test-user",
          items: allItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const paymentData = await paymentResponse.json();
      if (!paymentData.success) throw new Error(paymentData.error || 'Failed to initialize payment');
      window.location.href = paymentData.authorization_url;

    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setError("");
    setIsProcessing(true);
    try {
      const selectedCartItems = fixedCart.filter(item => selectedItems[item.id]);
      if (selectedCartItems.length === 0) throw new Error("Please select at least one item to purchase");

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          },
          deliveryMethod: deliveryMethod,
          deliveryFee: deliveryAccepted ? calculatedDeliveryFee : 0,
          items: selectedCartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")),
            quantity: Number(item.quantity) || 1,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            vendorRole: item.vendorRole,
            vendorBaseLocation: item.vendorBaseLocation,
          })),
          subtotal: selectedCartItems.reduce((acc, item) => {
            const price = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
            const quantity = Number(item.quantity) || 0;
            return acc + (price || 0) * quantity;
          }, 0),
          serviceFee: serviceFee,
          totalAmount: grandTotal,
          paymentMethod: 'COD',
          vendorGroups: vendorGroups
            .filter(group => effectiveSelectedVendors.includes(group.vendorId))
            .map(group => {
              const groupItems = group.items.filter(item => selectedItems[item.id]);
              return {
                vendorId: group.vendorId,
                vendorName: group.vendorName,
                vendorRole: group.vendorRole,
                vendorLocation: group.vendorLocation,
                vendorBaseLocation: group.rawLocation,
                items: groupItems.map(item => ({
                  productId: item.id,
                  name: item.name,
                  price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")),
                  quantity: Number(item.quantity) || 1,
                })),
                subtotal: groupItems.reduce((sum, item) => 
                  sum + (parseFloat(String(item.price).replace(/[^0-9.]/g, "")) * Number(item.quantity || 1)), 0
                ),
              };
            })
            .filter(group => group.items.length > 0),
          selectedVendors: effectiveSelectedVendors,
          selectedCompanyId: selectedCompany,
        }),
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        router.push(`/orders/${data.orderId}?status=cod`);
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (err: any) {
      console.error('❌ COD error:', err);
      setError(err.message || 'Failed to process order');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemCount === 0) {
      alert("Please select at least one item to purchase.");
      return;
    }
    if (deliveryMethod === "SITE_COMPANY") {
      if (!selectedCompany) {
        alert("Please select a delivery company.");
        return;
      }
      if (!deliveryCalculated) {
        alert("Please calculate the delivery fee first.");
        return;
      }
      if (!deliveryAccepted) {
        alert("Please accept the delivery fee to proceed.");
        return;
      }
      if (!deliveryForm.receiverName.trim() || !deliveryForm.receiverPhone.trim() || !deliveryForm.dropAddress.trim()) {
        alert("Please fill in all delivery details.");
        return;
      }
    }
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Please fill in all required fields.");
      return;
    }

    if (paymentMethod === "CARD") {
      await handlePaystackPayment();
    } else {
      await handleCashOnDelivery();
    }
  };

  if (!mounted || settingsLoading || loadingCompanies) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (fixedCart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-cream"
      >
        <h2 className="text-2xl font-bold text-dark mb-4">Your cart is empty</h2>
        <p className="text-dark/70 mb-8">It looks like you haven't added any items yet.</p>
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-dark text-cream rounded-xl font-semibold hover:bg-green flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Continue Shopping
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/cart">
          <motion.button whileHover={{ x: -5 }} className="flex items-center gap-2 text-dark/70 hover:text-dark mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Cart
          </motion.button>
        </Link>

        <h1 className="text-3xl font-bold text-dark mb-2">Checkout</h1>
        <p className="text-dark/70 mb-8">Complete your purchase securely</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.form 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-dark mb-6 pb-4 border-b border-dark/10">Billing Details</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={handleChange} 
                  className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="john@example.com" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Delivery Address *</label>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="123 Main Street" 
                  value={form.address} 
                  onChange={handleChange} 
                  className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="+234 800 000 0000" 
                  value={form.phone} 
                  onChange={handleChange} 
                  className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" 
                  required 
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-dark mb-4">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod("CARD")}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-green bg-green/10" : "border-dark/20 hover:border-green/50"}`}
                  >
                    <CreditCardIcon className="w-8 h-8 text-dark mb-2" />
                    <span className="text-sm font-medium">Pay with Card</span>
                    <span className="text-xs text-dark/60 mt-1">Powered by Paystack</span>
                  </div>
                  
                  <div 
                    onClick={() => setPaymentMethod("COD")}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === "COD" ? "border-green bg-green/10" : "border-dark/20 hover:border-green/50"}`}
                  >
                    <TruckIcon className="w-8 h-8 text-dark mb-2" />
                    <span className="text-sm font-medium">Cash on Delivery</span>
                    <span className="text-xs text-dark/60 mt-1">Pay when you receive</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="mt-8 p-5 rounded-2xl border border-dark/10 bg-white">
              <h3 className="text-lg font-bold text-dark mb-4">Delivery</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  { key: "SELF_PICKUP", label: "Self-Pickup" },
                  { key: "SITE_COMPANY", label: "Site Delivery" },
                ].map((opt) => (
                  <button 
                    type="button" 
                    key={opt.key} 
                    onClick={() => { 
                      setDeliveryMethod(opt.key as DeliveryMethod); 
                      if (opt.key !== "SITE_COMPANY") { 
                        setDeliveryCalculated(false);
                        setDeliveryAccepted(false);
                      } 
                    }} 
                    className={`border rounded-xl px-3 py-2 text-sm transition-all ${deliveryMethod === opt.key ? "bg-green/10 border-green font-semibold" : "hover:bg-cream border-dark/20"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {deliveryMethod === "SITE_COMPANY" && (
                <div className="space-y-4">
                  {/* Company Selection - Card Grid */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-dark mb-3">Select Delivery Company</label>
                    {companies.length === 0 ? (
                      <p className="text-sm text-red-500">No delivery companies available at the moment.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {companies.map((company) => {
                          const isSelected = selectedCompany === company._id;
                          return (
                            <button
                              key={company._id}
                              type="button"
                              onClick={() => {
                                setSelectedCompany(company._id);
                                setDeliveryCalculated(false);
                                setDeliveryAccepted(false);
                              }}
                              className={`
                                p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center
                                ${isSelected 
                                  ? 'border-green bg-green/10 ring-2 ring-green/30' 
                                  : 'border-dark/20 hover:border-green/50 bg-white'
                                }
                              `}
                            >
                              {/* Placeholder avatar - replace with company.logo if available */}
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green to-mustard flex items-center justify-center text-white font-bold text-lg mb-2">
                                {company.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-dark line-clamp-2">{company.name}</span>
                              {isSelected && (
                                <span className="mt-1 text-xs text-green font-semibold">Selected</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-sm font-medium mb-2">Choose vendor packages / items for delivery</div>

                  {vendorGroups.map((v) => {
                    const vendorItemIds = v.items.map((it) => it.id);
                    const vendorAllSelected = vendorItemIds.every((id) => !!selectedItems[id]);
                    return (
                      <div key={v.vendorId} className="border rounded-xl p-4 bg-cream border-dark/10">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={vendorAllSelected}
                              onChange={(e) => toggleVendorAll(v.vendorId, e.target.checked)}
                              className="w-4 h-4 text-green focus:ring-green"
                            />
                            <span className="font-semibold text-dark">{v.vendorName}</span>
                          </label>
                          <span className="text-sm text-dark/60">{v.items.length} item(s)</span>
                        </div>

                        <div className="pl-6">
                          {v.items.map((it) => (
                            <label key={it.id} className="flex items-center gap-3 mb-1 text-sm">
                              <input
                                type="checkbox"
                                checked={!!selectedItems[it.id]}
                                onChange={(e) => toggleItem(it.id, v.vendorId, e.target.checked)}
                                className="w-3 h-3 text-green focus:ring-green"
                              />
                              <span>{it.name} × {it.quantity}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <input 
                      className="border border-dark/20 rounded-xl p-3 focus:ring-2 focus:ring-green focus:border-transparent" 
                      placeholder="Receiver name" 
                      value={deliveryForm.receiverName} 
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, receiverName: e.target.value })} 
                      required
                    />
                    <input 
                      className="border border-dark/20 rounded-xl p-3 focus:ring-2 focus:ring-green focus:border-transparent" 
                      placeholder="Receiver phone" 
                      value={deliveryForm.receiverPhone} 
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, receiverPhone: e.target.value })} 
                      required
                    />
                    <input 
                      className="md:col-span-2 border border-dark/20 rounded-xl p-3 focus:ring-2 focus:ring-green focus:border-transparent" 
                      placeholder="Drop-off address / Landmark" 
                      value={deliveryForm.dropAddress} 
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, dropAddress: e.target.value })} 
                      required
                    />
                  </div>

                  {/* Customer Location Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-dark mb-2">
                      Your Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {["Eziobodo", "Umuchima", "Back gate"].map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => {
                            setCustomerLocation(location as CustomerLocation);
                            setDeliveryCalculated(false);
                            setDeliveryAccepted(false);
                          }}
                          className={`p-2 border rounded-lg text-center text-sm transition-all ${
                            customerLocation === location
                              ? "border-green bg-green/10 font-semibold"
                              : "border-dark/20 hover:bg-gray-50"
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Calculation Section */}
                  <div className="mt-4">
                    {!deliveryCalculated ? (
                      <button 
                        type="button" 
                        onClick={handleCalculateDelivery}
                        disabled={selectedItemCount === 0 || !deliveryForm.receiverName || !deliveryForm.receiverPhone || !deliveryForm.dropAddress || !selectedCompany}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          selectedItemCount === 0 || !deliveryForm.receiverName || !deliveryForm.receiverPhone || !deliveryForm.dropAddress || !selectedCompany
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-dark text-cream hover:bg-green"
                        }`}
                      >
                        Calculate Delivery Fee
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl border ${
                          deliveryAccepted 
                            ? 'bg-green/10 border-green' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-dark">Delivery Fee</div>
                              <div className="text-sm text-dark/60">
                                {effectiveSelectedVendors.length} vendor(s) to {customerLocation}
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-green">₦{calculatedDeliveryFee.toLocaleString()}</div>
                          </div>
                          
                          {!deliveryAccepted ? (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => setDeliveryAccepted(true)}
                                className="w-full py-2 bg-green text-white rounded-lg font-medium hover:bg-green/90 transition-colors"
                              >
                                Accept Delivery Fee
                              </button>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-green">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Delivery fee accepted</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDeliveryAccepted(false)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Change
                              </button>
                            </div>
                          )}
                        </div>

                        {companyPricing.length > 0 && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-sm font-medium text-dark mb-2">Delivery Breakdown</div>
                            {vendorGroups
                              .filter(v => effectiveSelectedVendors.includes(v.vendorId))
                              .map(vendor => {
                                const fee = calculateFeeForVendor(vendor.vendorLocation, customerLocation);
                                return (
                                  <div key={vendor.vendorId} className="flex justify-between text-sm py-1">
                                    <span className="text-gray-600">
                                      {vendor.vendorName} ({vendor.rawLocation} → {customerLocation})
                                    </span>
                                    <span className="font-medium">₦{fee.toLocaleString()}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <MotionButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isProcessing || (deliveryMethod === "SITE_COMPANY" && (!deliveryCalculated || !deliveryAccepted))}
              className={`mt-8 w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isProcessing || (deliveryMethod === "SITE_COMPANY" && (!deliveryCalculated || !deliveryAccepted))
                  ? "bg-dark/50 text-cream/70 cursor-not-allowed"
                  : "bg-dark text-cream hover:bg-green"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : paymentMethod === "CARD" ? (
                `Pay ₦${grandTotal.toLocaleString()}`
              ) : (
                `Place Order (₦${grandTotal.toLocaleString()})`
              )}
            </MotionButton>

            <p className="text-xs text-dark/50 mt-4 text-center">
              {paymentMethod === "CARD" 
                ? "Secure payment processed by Paystack" 
                : "You'll pay when your order arrives"}
            </p>
          </motion.form>

          {/* Order Summary */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }} 
            className="bg-white rounded-2xl shadow-lg p-6 border border-white/20 h-fit sticky top-6"
          >
            <h2 className="text-xl font-bold text-dark mb-6 pb-4 border-b border-dark/10">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {fixedCart.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b border-dark/10 last:border-0">
                  <div>
                    <p className="font-medium text-dark">{item.name} × {item.quantity}</p>
                    <p className="text-sm text-dark/70">₦{Number(item.price || 0).toLocaleString()} each</p>
                    {item.vendorName && (
                      <div className="text-xs text-dark/50 mt-1">
                        From: {item.vendorName}
                        {item.vendorBaseLocation && ` (${item.vendorBaseLocation})`}
                        {!selectedItems[item.id] && (
                          <span className="text-red-500 ml-2">(Not selected)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-dark">
                    ₦{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                    {!selectedItems[item.id] && (
                      <span className="text-xs text-red-500 ml-2">(Excluded)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-dark/10">
              <div className="flex justify-between text-dark">
                <span>Subtotal ({selectedItemCount} items)</span>
                <span>₦{filteredSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-dark">
                <span>
                  Service Fee ({serviceFeePercentage}%)
                  <span className="text-xs text-dark/50 block">Platform maintenance</span>
                </span>
                <span>₦{serviceFee.toLocaleString()}</span>
              </div>

              {deliveryMethod === "SITE_COMPANY" && deliveryAccepted && (
                <div className="flex justify-between text-dark">
                  <span>
                    Delivery Fee
                    <span className="text-xs text-dark/50 block">
                      To {customerLocation} ({effectiveSelectedVendors.length} vendor(s))
                    </span>
                  </span>
                  <span className="text-green-600 font-semibold">₦{calculatedDeliveryFee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-dark pt-3 border-t border-dark/10">
                <span>Total</span>
                <span className="text-green-600">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cream rounded-xl border border-dark/10">
              <h3 className="font-semibold text-dark mb-2">Delivery Method</h3>
              <p className="text-sm text-dark/70 mb-2">
                {deliveryMethod === "SITE_COMPANY" && "Site Delivery (Company Rider)"}
                {deliveryMethod === "SELF_PICKUP" && "Self Pickup"}
              </p>
              {deliveryMethod === "SITE_COMPANY" && deliveryAccepted && selectedCompany && (
                <p className="text-xs text-dark/60">
                  Company: {companies.find(c => c._id === selectedCompany)?.name || 'Selected'} • 
                  Delivery: ₦{calculatedDeliveryFee.toLocaleString()} • To: {customerLocation}
                </p>
              )}
            </div>

            <div className="mt-6 p-4 bg-green/10 rounded-xl border border-green/20">
              <h3 className="font-semibold text-dark mb-2">
                {paymentMethod === "CARD" ? "Secure Payment" : "Cash on Delivery"}
              </h3>
              <p className="text-sm text-dark/70">
                {paymentMethod === "CARD" 
                  ? "Your payment is processed securely by Paystack. We never store your card details." 
                  : "You'll pay the total amount when your order arrives at your location."}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}