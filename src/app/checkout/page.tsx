"use client";

import React, { useState, forwardRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type MotionProps } from "framer-motion";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CreditCardIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { genId, saveParent, saveChildren } from "../../utils/orders.store";

/* ---- MotionButton wrapper (fix framer-motion typing) ---- */
type ButtonHTMLProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type MotionButtonProps = ButtonHTMLProps & MotionProps;
const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (props, ref) => <motion.button ref={ref} {...props} />
);
MotionButton.displayName = "MotionButton";

/* ---- Types ---- */
type DeliveryMethod =
  | "SITE_COMPANY"
  | "SELF_PICKUP"
  | "OWN_RIDER"
  | "VENDOR_RIDER";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "card",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // calculate subtotal and admin fee
  const subtotal = cart.reduce((acc, item) => {
    const price = parseFloat(
      String(item.price)
        .replace(/[^0-9.]/g, "") // remove ₦, commas, and other symbols
    );
    const quantity = Number(item.quantity) || 0;
    return acc + (price || 0) * quantity;
  }, 0);
  const adminFeePercentage = 7; // top vendors later can be 5%
  const adminFee = (subtotal * adminFeePercentage) / 100;
  const baseTotal = subtotal + adminFee;

  // delivery states
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("SELF_PICKUP");
  const [deliveryForm, setDeliveryForm] = useState({
    receiverName: "",
    receiverPhone: "",
    dropAddress: "",
    window: "ASAP",
    notes: "",
    companyId: "defaultCo",
  });

  // Group items by vendor (fallbacks for items without vendor fields)
  const vendorGroups = (() => {
    const map = new Map<
      string,
      { vendorId: string; vendorName: string; items: any[] }
    >();
    cart.forEach((i: any) => {
      const vendorId = i.vendorId ?? "single";
      const vendorName = i.vendorName ?? "Sellect All";
      if (!map.has(vendorId)) map.set(vendorId, { vendorId, vendorName, items: [] });
      map.get(vendorId)!.items.push(i);
    });
    return Array.from(map.values());
  })();

  // For selecting vendors (used for vendor-level "select all" convenience)
  const [selectedVendors, setSelectedVendors] = useState<string[]>(
    vendorGroups.map((v) => v.vendorId)
  );

  // For selecting items individually (keyed by item.id)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  // initialize selected items when cart changes (select all by default)
  useEffect(() => {
    const init: Record<string, boolean> = {};
    cart.forEach((i: any) => {
      init[i.id] = true;
    });
    setSelectedItems(init);
    setSelectedVendors(vendorGroups.map((v) => v.vendorId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  // Effective selected vendors (if single vendor, force it)
  const effectiveSelectedVendors =
    vendorGroups.length <= 1
      ? [vendorGroups[0]?.vendorId ?? "single"]
      : selectedVendors;

  // quote states
  const [isRequestingQuote, setIsRequestingQuote] = useState(false);
  const [quote, setQuote] = useState<{
    amount: number;
    etaMins: number;
    expiresAt: string;
    notes?: string;
  } | null>(null);
  const [quoteAccepted, setQuoteAccepted] = useState(false);

  // totals
  const selectedItemCount = Object.values(selectedItems).filter(Boolean).length;
  const deliveryAddOn = quoteAccepted && quote ? quote.amount : 0;
  const grandTotal = baseTotal + deliveryAddOn;

  /* ---- Handlers ---- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 // toggle single item's selection
const toggleItem = (itemId: string, vendorId: string, checked: boolean) => {
  setSelectedItems((prev) => {
    const updated = { ...prev, [itemId]: checked };

    const vendorItemIds = (
      vendorGroups.find((v) => v.vendorId === vendorId)?.items || []
    ).map((i) => i.id);

    const allChecked = vendorItemIds.every((id) =>
      id === itemId ? checked : updated[id]
    );

    setSelectedVendors((prevV) =>
      allChecked
        ? Array.from(new Set([...prevV, vendorId]))
        : prevV.filter((id) => id !== vendorId)
    );

    return updated;
  });
};

  // toggle select-all for a vendor
  const toggleVendorAll = (vendorId: string, checked: boolean) => {
    const vendor = vendorGroups.find((v) => v.vendorId === vendorId);
    if (!vendor) return;
    setSelectedItems((prev) => {
      const next = { ...prev };
      vendor.items.forEach((it) => (next[it.id] = checked));
      return next;
    });
    setSelectedVendors((prev) =>
      checked ? Array.from(new Set([...prev, vendorId])) : prev.filter((id) => id !== vendorId)
    );
  };

  const handleRequestQuote = () => {
    // Validate
    if (
      !deliveryForm.receiverName.trim() ||
      !deliveryForm.receiverPhone.trim() ||
      !deliveryForm.dropAddress.trim()
    ) {
      alert("Fill delivery form (receiver name/phone/address).");
      return;
    }
    // ensure at least one selected item
    if (selectedItemCount === 0) {
      alert("Select at least one item to include in site delivery.");
      return;
    }

    setIsRequestingQuote(true);
    // MOCK: compute a quote based on number of selected items (for demo)
    setTimeout(() => {
      const perItem = 400; // mock per-item cost
      const amount = perItem * selectedItemCount + 200; // base
      const etaMins = 30 + Math.floor(Math.random() * 15);
      const expiresAt = new Date(Date.now() + 12 * 60 * 1000).toISOString();
      setQuote({ amount, etaMins, expiresAt, notes: "Campus delivery" });
      setIsRequestingQuote(false);
    }, 1100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      // Note: this simulates payment + writing order records
      const parentId = genId();
      const vendorIds = Array.from(new Set(cart.map((i: any) => i.vendorId ?? "single")));

      // create child orders for each vendor (keep all items for vendor)
      const childOrders = vendorIds.map((vId) => {
        const items = cart.filter((i: any) => (i.vendorId ?? "single") === vId);
        const subtotal = items.reduce(
          (a: number, i: any) => a + Number(i.price || 0) * Number(i.quantity || 1),
          0
        );
        return {
          id: genId(),
          parentId,
          vendorId: vId,
          vendorName: items[0]?.vendorName || "Vendor",
          items,
          subtotal,
          deliveryChoice: deliveryMethod,
          pickupCode: String(Math.floor(100000 + Math.random() * 900000)),
        };
      });
      saveChildren(childOrders);

      // selected childIDs are vendors that have at least one selected item
      const selectedChildIds = childOrders
        .filter((c) => c.items.some((it: any) => selectedItems[it.id]))
        .map((c) => c.id);

      // also store which item ids were selected for delivery
      const selectedItemIds = Object.entries(selectedItems)
        .filter(([_, val]) => val)
        .map(([id]) => id);

      const parent: any = {
        id: parentId,
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
        },
        childOrderIds: childOrders.map((c) => c.id),
        selectedChildIds,
        selectedItemIds,
        method: deliveryMethod,
        deliveryStatus: "COMPLETED",
        timeline: [],
      };

      if (deliveryMethod === "SITE_COMPANY") {
        if (quoteAccepted && quote) {
          const CUT = 0.05;
          const adminCutAmount = Math.round(quote.amount * CUT);
          const companyPayout = quote.amount - adminCutAmount;
          parent.quote = quote;
          parent.addOn = {
            amount: quote.amount,
            adminCutPct: CUT,
            adminCutAmount,
            companyPayout,
            paid: true,
            paidAt: new Date().toISOString(),
          };
          parent.deliveryStatus = "DELIVERY_PAID";
          parent.deliveryForm = {
            window: deliveryForm.window,
            notes: deliveryForm.notes,
            companyId: deliveryForm.companyId,
          };
        } else {
          // Fallback: no quote accepted -> treat as self pickup (should be handled by UI guard)
          parent.method = "SELF_PICKUP";
          parent.deliveryStatus = "COMPLETED";
        }
      }

      saveParent(parent);

      clearCart();
      setIsProcessing(false);
      router.replace(`/orders/${parentId}`);
    }, 900);
  };

  if (cart.length === 0) {
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

  /* ---- UI ---- */
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
        <p className="text-dark/70 mb-8">Complete your purchase with secure Monify payment</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.form initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-dark mb-6 pb-4 border-b border-dark/10">Billing Details</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Full Name</label>
                <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Email Address</label>
                <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Delivery Address</label>
                <input type="text" name="address" placeholder="123 Main Street" value={form.address} onChange={handleChange} className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Phone Number</label>
                <input type="tel" name="phone" placeholder="+234 800 000 0000" value={form.phone} onChange={handleChange} className="w-full border border-dark/20 rounded-xl p-3.5 focus:ring-2 focus:ring-green focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-4">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "card", label: "Card", icon: CreditCardIcon },
                    { key: "bank", label: "Bank Transfer", icon: BanknotesIcon },
                    { key: "cod", label: "Cash on Delivery", icon: TruckIcon },
                  ].map((m) => (
                    <div key={m.key} onClick={() => setForm({ ...form, paymentMethod: m.key })} className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${form.paymentMethod === m.key ? "border-green bg-green/10" : "border-dark/20 hover:border-green/50"}`}>
                      <m.icon className="w-8 h-8 text-dark mb-2" />
                      <span className="text-sm font-medium">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="mt-8 p-5 rounded-2xl border border-dark/10 bg-white">
              <h3 className="text-lg font-bold text-dark mb-4">Delivery</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                {[
                  { key: "SITE_COMPANY", label: "Site Delivery" },
                  { key: "SELF_PICKUP", label: "Self-Pickup" },
                  { key: "OWN_RIDER", label: "Own Rider" },
                  { key: "VENDOR_RIDER", label: "Vendor’s Rider" },
                ].map((opt) => (
                  <button type="button" key={opt.key} onClick={() => { setDeliveryMethod(opt.key as DeliveryMethod); if (opt.key !== "SITE_COMPANY") { setQuote(null); setQuoteAccepted(false); setIsRequestingQuote(false); } }} className={`border rounded-xl px-3 py-2 text-sm transition-all ${deliveryMethod === opt.key ? "bg-green/10 border-green font-semibold" : "hover:bg-cream"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Item-level selection UI when Site Delivery chosen */}
              {deliveryMethod === "SITE_COMPANY" && (
                <div className="space-y-4">
                  <div className="text-sm font-medium mb-2">Choose vendor packages / items for delivery</div>

                  {vendorGroups.map((v) => {
                    const vendorItemIds = v.items.map((it) => it.id);
                    const vendorAllSelected = vendorItemIds.every((id) => !!selectedItems[id]);
                    return (
                      <div key={v.vendorId} className="border rounded-xl p-4 bg-cream">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={vendorAllSelected}
                              onChange={(e) => toggleVendorAll(v.vendorId, e.target.checked)}
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
                              />
                              <span>{it.name} × {it.quantity}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Delivery form inputs */}
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <input className="border rounded-xl p-3" placeholder="Receiver name" value={deliveryForm.receiverName} onChange={(e) => setDeliveryForm({ ...deliveryForm, receiverName: e.target.value })} />
                    <input className="border rounded-xl p-3" placeholder="Receiver phone" value={deliveryForm.receiverPhone} onChange={(e) => setDeliveryForm({ ...deliveryForm, receiverPhone: e.target.value })} />
                    <input className="md:col-span-2 border rounded-xl p-3" placeholder="Drop-off address / Landmark" value={deliveryForm.dropAddress} onChange={(e) => setDeliveryForm({ ...deliveryForm, dropAddress: e.target.value })} />
                  </div>

                  {/* Request quote */}
                  {!quote && !isRequestingQuote && (
                    <div className="mt-3">
                      <button type="button" onClick={handleRequestQuote} className="px-4 py-2 rounded-lg bg-dark text-cream">Request Quote</button>
                    </div>
                  )}

                  {isRequestingQuote && <div className="text-sm text-dark/70 mt-2">Requesting quote…</div>}

                  {quote && !quoteAccepted && (
                    <div className="border rounded-xl p-4 mt-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">Quote</div>
                          <div className="text-sm text-dark/70">ETA {quote.etaMins} mins • Expires soon</div>
                          {quote.notes && <div className="text-sm mt-1">{quote.notes}</div>}
                        </div>
                        <div className="text-2xl font-bold">₦{quote.amount.toLocaleString()}</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button type="button" className="px-4 py-2 rounded-lg bg-dark text-cream" onClick={() => setQuoteAccepted(true)}>Accept</button>
                        <button type="button" className="px-4 py-2 rounded-lg border" onClick={() => { setQuote(null); setQuoteAccepted(false); }}>Decline</button>
                      </div>
                    </div>
                  )}

                  {quoteAccepted && (
                    <div className="p-3 rounded-lg bg-green/10 border text-sm mt-2">
                      Delivery add-on accepted: <strong>₦{quote?.amount.toLocaleString()}</strong> will be added to Total.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pay Button */}
            <MotionButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              // force boolean using !!
              disabled={!!(isProcessing || (deliveryMethod === "SITE_COMPANY" && quote && !quoteAccepted))}
              className={`mt-8 w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isProcessing ? "bg-dark/70 text-cream cursor-not-allowed" : "bg-dark text-cream hover:bg-green"}`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay ₦${grandTotal.toLocaleString()}`
              )}
            </MotionButton>

            {/* Optional: food-only fallback if quote not accepted */}
            {deliveryMethod === "SITE_COMPANY" && (!quote || !quoteAccepted) && (
              <button type="button" onClick={() => { setDeliveryMethod("SELF_PICKUP"); alert("Paying for food only. You can arrange delivery later from your Order page."); }} className="mt-3 w-full py-3 border rounded-xl text-sm">
                Or pay food-only now
              </button>
            )}

            <p className="text-xs text-dark/50 mt-4 text-center">Secure payment processed by Monify</p>
          </motion.form>

          {/* Order Summary */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-lg p-6 border border-white/20 h-fit sticky top-6">
            <h2 className="text-xl font-bold text-dark mb-6 pb-4 border-b border-dark/10">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b border-dark/10 last:border-0">
                  <div>
                    <p className="font-medium text-dark">{item.name} × {item.quantity}</p>
                    <p className="text-sm text-dark/70">₦{Number(item.price || 0).toLocaleString()} each</p>
                    {item.vendorName && <div className="text-xs text-dark/50 mt-1">From: {item.vendorName}</div>}
                  </div>
                  <span className="font-semibold text-dark">₦{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-dark/10">
              <div className="flex justify-between text-dark">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-dark">
                <span>
                  Admin Fee ({adminFeePercentage}%)
                  <span className="text-xs text-dark/50 block">For platform maintenance</span>
                </span>
                <span>₦{adminFee.toLocaleString()}</span>
              </div>

              {deliveryMethod === "SITE_COMPANY" && quoteAccepted && quote && (
                <div className="flex justify-between text-dark">
                  <span>Delivery Add-On</span>
                  <span>₦{quote.amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-dark pt-3 border-t border-dark/10">
                <span>Total</span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green/10 rounded-xl">
              <h3 className="font-semibold text-dark mb-2">About Admin Fees</h3>
              <p className="text-sm text-dark/70">A {adminFeePercentage}% admin fee is applied to all orders. This fee supports platform maintenance, payment processing, and ensures a seamless shopping experience. For top vendors, this fee is reduced to 5%.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}