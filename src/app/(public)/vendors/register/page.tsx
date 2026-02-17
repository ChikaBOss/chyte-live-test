"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VendorRegisterPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [pickupZone, setPickupZone] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !businessName ||
      !ownerName ||
      !email ||
      !password ||
      !pickupZone ||
      !pickupPhone
    ) {
      alert("Please complete all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          ownerName,
          email,
          phone,
          pickupZone,
          pickupPhone,
          pickupAddress,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Registration failed");
        return;
      }

      alert("Submitted successfully! Await admin approval.");
      router.push("/");
    } catch (err) {
      console.error("Vendor registration error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 px-6 bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Register as a Vendor
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Vendors are reviewed manually before approval.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Business Name *
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Mama Chisom Kitchen"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Owner Name *
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Email *
              </label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Business Phone
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Pickup Details */}
          <div>
            <label className="block text-sm mb-1">
              Pickup Phone *
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={pickupPhone}
              onChange={(e) => setPickupPhone(e.target.value)}
              placeholder="Phone riders can call"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Pickup Location *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={pickupZone}
              onChange={(e) => setPickupZone(e.target.value)}
            >
              <option value="">Select pickup location</option>

              <option value="EZIOBODO">Eziobodo</option>
              <option value="EZIOBODO_MARKET">Eziobodo Market Square</option>
              <option value="INSIDE_SCHOOL">Inside School</option>
              <option value="UMUCHIMA">Umuchima</option>
              <option value="BACK_GATE">Back Gate</option>
              <option value="IHIAGWA">Ihiagwa</option>
              <option value="IHIAGWA_MARKET">Ihiagwa After Market Square</option>
              <option value="FUTO_GATE_ROAD">Along FUTO Gate Road</option>
              <option value="FUTO_JUNCTION">After FUTO Junction (BK, Sambawizzy)</option>
              <option value="REDEMPTION_ESTATE">Redemption Estate</option>
              <option value="AVU_JUNCTION">Avu Junction</option>
              <option value="HOSPITAL_JUNCTION">Hospital Junction</option>
              <option value="WORLD_BANK">New Owerri / World Bank</option>
              <option value="POLY_JUNCTION">Poly Junction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">
              Pickup Address (Optional)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Extra directions for rider (e.g. beside XYZ shop)"
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm mb-1">
              Password *
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-dark text-cream py-3 rounded hover:bg-green transition disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit for Approval"}
          </button>
        </form>
      </div>
    </section>
  );
}