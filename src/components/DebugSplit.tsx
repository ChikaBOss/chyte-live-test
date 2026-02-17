"use client";

import { useState } from "react";

export default function DebugSplit() {
  const [orderId, setOrderId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [vendorRole, setVendorRole] = useState<
    "chef" | "vendor" | "pharmacy" | "topvendor"
  >("chef");
  const [subtotal, setSubtotal] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // ================= CREATE TEST ORDER =================
  const createTestOrder = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/debug/create-test-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          vendorRole, // 🔥 EXPLICIT ROLE
          subtotal,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrderId(data.orderId);
        setResult({
          type: "order_created",
          data,
          message: "✅ Test order created successfully!",
        });
      } else {
        setError(data.error || "Failed to create test order");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= MANUAL SPLIT =================
  const triggerManualSplit = async () => {
    if (!orderId) {
      setError("Please create an order first or enter an order ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/debug/manual-split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          type: "split_success",
          data,
          message: "✅ Money split successfully!",
        });
      } else {
        setError(data.error || "Split failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= CHECK DATABASE =================
  const checkDatabase = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/debug/check-order?orderId=${orderId}`);
      const data = await res.json();
      setResult({
        type: "database_check",
        data,
        message: "📊 Database state:",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧪 Debug Split Logic
      </h2>
      <p className="text-gray-600 mb-6">
        Test your payment split logic WITHOUT Paystack, webhooks, or ngrok.
      </p>

      <div className="space-y-4">
        {/* STEP 1 */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold text-gray-700 mb-2">
            Step 1: Create Test Order
          </h3>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter OWNER ID (Chef / Vendor / Pharmacy / TopVendor)"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full p-2 border rounded"
            />

            {/* ROLE SELECTOR */}
            <select
              value={vendorRole}
              onChange={(e) =>
                setVendorRole(
                  e.target.value as
                    | "chef"
                    | "vendor"
                    | "pharmacy"
                    | "topvendor"
                )
              }
              className="w-full p-2 border rounded"
            >
              <option value="chef">Chef</option>
              <option value="vendor">Vendor</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="topvendor">TopVendor</option>
            </select>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Subtotal (₦)
              </label>
              <input
                type="number"
                value={subtotal}
                onChange={(e) => setSubtotal(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={createTestOrder}
              disabled={loading || !vendorId}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Test Order"}
            </button>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold text-gray-700 mb-2">
            Step 2: Trigger Manual Split
          </h3>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Order ID from Step 1"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 p-2 border rounded"
            />

            <button
              onClick={triggerManualSplit}
              disabled={loading || !orderId}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Splitting..." : "Split Money"}
            </button>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold text-gray-700 mb-2">
            Step 3: Verify Database
          </h3>

          <button
            onClick={checkDatabase}
            disabled={loading || !orderId}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            Check Database State
          </button>
        </div>

        {/* RESULTS */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            ❌ Error: {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <p className="font-bold text-green-800">{result.message}</p>
            <pre className="mt-2 text-sm bg-gray-800 text-gray-100 p-3 rounded overflow-auto max-h-60">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-bold text-yellow-800 mb-2">
          📋 What to Check in MongoDB:
        </h4>
        <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
          <li>
            Order <code>payment.status</code> should be <b>PAID</b>
          </li>
          <li>
            Order <code>distribution</code> should have amounts
          </li>
          <li>
            Owner wallet balance should increase by subtotal
          </li>
          <li>
            Platform wallet balance should increase by admin fee
          </li>
          <li>
            Transactions collection should have 2–3 new records
          </li>
        </ul>
      </div>
    </div>
  );
}