"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export function DeliveryCard({ delivery, onStatusChange }) {
  const id = delivery._id;

  // Extract customer info from delivery object
  const customer = delivery.customerPhone || "Customer";
  const phone = delivery.customerPhone || "—";
  const dropoff = delivery.dropAddress || "Dropoff address";

  const pickup =
    delivery.vendors?.map((v) => v.vendorName).join(", ") || "Vendor(s)";

  // Update status map to match your model's enum values
  const statusMap = {
    PENDING_QUOTE: "pending",
    QUOTED: "pending", // Still pending customer acceptance
    ACCEPTED: "ongoing",
    ASSIGNED: "ongoing", // Note: your model has ASSIGNED, not IN_TRANSIT
    IN_TRANSIT: "ongoing",
    DELIVERED: "completed",
    CANCELLED: "rejected", // Use CANCELLED instead of REJECTED
    EXPIRED: "rejected",
  };

  const status = statusMap[delivery.status] || "pending";

  const statusConfig = {
    pending: { color: "bg-yellow-500", text: "New Request", icon: "🆕" },
    ongoing: { color: "bg-blue-500", text: "In Progress", icon: "🚗" },
    completed: { color: "bg-green", text: "Completed", icon: "✅" },
    rejected: { color: "bg-red-500", text: "Cancelled", icon: "❌" }, // Changed text to "Cancelled"
  };

  const config = statusConfig[status];

  const [accepted, setAccepted] = useState(false);
  const [price, setPrice] = useState("");
  const [etaMins, setEtaMins] = useState("60");
  const [notes, setNotes] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleReject = async () => {
    if (!confirm("Are you sure you want to cancel this delivery request?")) {
      return;
    }

    try {
      setIsRejecting(true);
      
      const res = await fetch("/api/delivery/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryJobId: id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel delivery request");
      }

      onStatusChange("CANCELLED");
      alert("Delivery request cancelled successfully");
      
    } catch (error) {
      alert(error.message || "Failed to cancel delivery request");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendQuote = async () => {
    if (!price || Number(price) <= 0) {
      alert("Enter a valid delivery price");
      return;
    }

    if (!etaMins || Number(etaMins) <= 0) {
      alert("Enter a valid ETA in minutes");
      return;
    }

    try {
      setIsSending(true);
      
      const res = await fetch("/api/delivery/respond-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryJobId: id,
          price: Number(price),
          etaMins: Number(etaMins),
          notes: notes
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send quote");
      }

      onStatusChange("QUOTED");
      
      setAccepted(false);
      setPrice("");
      setEtaMins("60");
      setNotes("");
      
      alert(`Quote sent successfully! ₦${Number(price).toLocaleString()}`);
    } catch (error) {
      alert(error.message || "Failed to send quote");
    } finally {
      setIsSending(false);
    }
  };

  const handleComplete = async () => {
    try {
      const res = await fetch("/api/delivery/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryJobId: id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark as complete");
      }

      onStatusChange("DELIVERED");
      alert("Delivery marked as completed");
    } catch (error) {
      alert(error.message || "Failed to mark as complete");
    }
  };

  // If delivery is cancelled, show different UI
  if (delivery.status === "CANCELLED" || delivery.status === "EXPIRED") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-red-200 p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-dark">Delivery Request #{id?.slice(-6)}</h3>
            <p className="text-olive text-sm">{customer}</p>
            <p className="text-dark/70 text-sm mt-1">{dropoff}</p>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-bold text-cream bg-red-500 flex items-center gap-2">
            ❌ {delivery.status === "EXPIRED" ? "Expired" : "Cancelled"}
          </span>
        </div>
        <div className="p-4 bg-red-50 rounded-xl">
          <p className="text-sm text-dark">
            This delivery request has been {delivery.status === "EXPIRED" ? "expired" : "cancelled"}.
          </p>
          <p className="text-xs text-dark/60 mt-1">The customer has been notified.</p>
        </div>
      </motion.div>
    );
  }

  // If delivery is quoted, show quote details
  if (delivery.status === "QUOTED") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-2xl shadow-lg border border-mustard/20 p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-dark"
            >
              {customer}
            </motion.h3>
            <p className="text-olive text-sm">{phone}</p>
            <p className="text-dark/50 text-xs">Delivery #{id?.slice(-6)}</p>
          </div>

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-4 py-2 rounded-full text-sm font-bold text-cream bg-green flex items-center gap-2"
          >
            ✅ Quoted
          </motion.span>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between mb-4 p-4 bg-cream rounded-xl">
          <div className="text-center">
            <div className="w-3 h-3 bg-green rounded-full"></div>
            <p className="text-xs text-dark/70 mt-1">Pickup</p>
            <p className="text-sm font-semibold text-dark">{pickup}</p>
          </div>

          <div className="flex-1 mx-4 h-0.5 bg-mustard/30"></div>

          <div className="text-center">
            <div className="w-3 h-3 bg-green rounded-full"></div>
            <p className="text-xs text-dark/70 mt-1">Dropoff</p>
            <p className="text-sm font-semibold text-dark">{dropoff}</p>
          </div>
        </div>

        {/* Quote Details */}
        <div className="mb-6 p-4 bg-green-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-dark">Quote Details:</span>
            <span className="text-2xl font-bold text-green-600">
              ₦{delivery.quotedAmount?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-dark/70">ETA:</span>
              <span className="ml-2 font-medium">{delivery.etaMins || "0"} mins</span>
            </div>
            <div>
              <span className="text-dark/70">Status:</span>
              <span className="ml-2 font-medium">Awaiting Customer Response</span>
            </div>
          </div>
          {delivery.notes && (
            <div className="mt-2 text-sm">
              <span className="text-dark/70">Notes:</span>
              <p className="mt-1 text-dark">{delivery.notes}</p>
            </div>
          )}
          {delivery.expiresAt && (
            <div className="mt-2 text-sm">
              <span className="text-dark/70">Expires:</span>
              <span className="ml-2 font-medium">
                {new Date(delivery.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-6">
          <p className="text-dark font-semibold mb-2">Vendors:</p>
          <div className="flex flex-wrap gap-2">
            {delivery.vendors?.map((vendor, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-mustard/10 text-dark rounded-full text-sm"
              >
                {vendor.vendorName || `Vendor ${index + 1}`}
              </span>
            ))}
          </div>
        </div>

        {/* Cancel Quote Button */}
        <div className="mt-4">
          <button
            onClick={handleReject}
            disabled={isRejecting}
            className={`w-full px-4 py-2 bg-red-500 text-cream rounded-xl font-semibold hover:bg-red-600 transition-colors ${
              isRejecting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isRejecting ? "Cancelling..." : "❌ Cancel Quote"}
          </button>
          <p className="text-xs text-dark/50 mt-2 text-center">
            This will notify the customer that the quote has been withdrawn
          </p>
        </div>
      </motion.div>
    );
  }

  // If delivery is completed
  if (delivery.status === "DELIVERED") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-green-200 p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-dark">Delivery #{id?.slice(-6)}</h3>
            <p className="text-olive text-sm">{customer}</p>
            <p className="text-dark/70 text-sm mt-1">{dropoff}</p>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-bold text-cream bg-green flex items-center gap-2">
            ✅ Delivered
          </span>
        </div>
        <div className="p-4 bg-green-50 rounded-xl">
          <p className="text-sm text-dark">This delivery has been completed.</p>
          {delivery.quotedAmount && (
            <p className="text-sm text-dark mt-1">
              Amount: ₦{delivery.quotedAmount.toLocaleString()}
            </p>
          )}
          {delivery.updatedAt && (
            <p className="text-xs text-dark/60 mt-1">
              Completed at: {new Date(delivery.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Default view for PENDING_QUOTE
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg border border-mustard/20 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-dark"
          >
            {customer}
          </motion.h3>
          <p className="text-olive text-sm">{phone}</p>
          <p className="text-dark/50 text-xs">Delivery #{id?.slice(-6)}</p>
        </div>

        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`px-4 py-2 rounded-full text-sm font-bold text-cream ${config.color} flex items-center gap-2`}
        >
          {config.icon} {config.text}
        </motion.span>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-4 p-4 bg-cream rounded-xl">
        <div className="text-center">
          <div className="w-3 h-3 bg-green rounded-full"></div>
          <p className="text-xs text-dark/70 mt-1">Pickup</p>
          <p className="text-sm font-semibold text-dark">{pickup}</p>
        </div>

        <div className="flex-1 mx-4 h-0.5 bg-mustard/30"></div>

        <div className="text-center">
          <div className="w-3 h-3 bg-green rounded-full"></div>
          <p className="text-xs text-dark/70 mt-1">Dropoff</p>
          <p className="text-sm font-semibold text-dark">{dropoff}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <p className="text-dark font-semibold mb-2">Vendors:</p>
        <div className="flex flex-wrap gap-2">
          {delivery.vendors?.map((vendor, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-mustard/10 text-dark rounded-full text-sm"
            >
              {vendor.vendorName || `Vendor ${index + 1}`}
            </span>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3">
        {/* STATE 1: PENDING_QUOTE */}
        {!accepted && (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAccepted(true)}
              className="flex-1 bg-green text-cream py-3 rounded-xl font-bold shadow-lg"
            >
              ✅ Accept & Quote
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              disabled={isRejecting}
              className={`flex-1 bg-red-500 text-cream py-3 rounded-xl font-bold shadow-lg ${
                isRejecting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isRejecting ? "Cancelling..." : "❌ Cancel"}
            </motion.button>
          </div>
        )}

        {/* STATE 2: ACCEPTED → ENTER PRICE */}
        {accepted && (
          <>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Enter delivery price (₦)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border rounded-xl p-3 w-full"
                min="0"
              />
              
              <input
                type="number"
                placeholder="ETA in minutes"
                value={etaMins}
                onChange={(e) => setEtaMins(e.target.value)}
                className="border rounded-xl p-3 w-full"
                min="1"
              />
              
              <textarea
                placeholder="Notes for customer (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border rounded-xl p-3 w-full"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendQuote}
                disabled={isSending}
                className={`flex-1 bg-dark text-cream py-3 rounded-xl font-bold shadow-lg ${
                  isSending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSending ? "Sending..." : "📤 Send Quote"}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAccepted(false)}
                className="flex-1 border border-dark text-dark py-3 rounded-xl font-bold"
              >
                Cancel
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}