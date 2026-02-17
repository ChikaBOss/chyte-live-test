"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UploadedDoc = {
  name: string;
  type: string;
  data: string; // base64
};

export default function PharmacyRegisterPage() {
  const router = useRouter();

  const [pharmacyName, setPharmacyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [pickupZone, setPickupZone] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= DOCUMENT UPLOAD ================= */

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        setDocuments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            data: reader.result as string,
          },
        ]);
      };

      reader.readAsDataURL(file);
    });
  }

  /* ================= SUBMIT ================= */

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !pharmacyName ||
      !ownerName ||
      !email ||
      !password ||
      !pickupZone ||
      !pickupPhone
    ) {
      alert("Please complete all required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (documents.length === 0) {
      alert("Please upload at least one verification document");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pharmacies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyName,
          ownerName,
          email,
          phone,
          pickupZone,
          pickupPhone,
          pickupAddress,
          password,
          documents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Registration failed");
        return;
      }

      alert("Pharmacy registered successfully! Await admin approval.");
      router.push("/");
    } catch (err) {
      console.error("Pharmacy registration error:", err);
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
            Register as a Pharmacy
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Upload valid documents for verification before approval.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Pharmacy Name *
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                placeholder="e.g. Chisom Pharmacy"
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
                placeholder="Full name of owner"
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
                placeholder="pharmacy@example.com"
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
                placeholder="+234 800 000 0000"
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
              placeholder="Phone riders can call for pickup"
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
              <option value="FUTO_JUNCTION">After FUTO Junction</option>
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
              placeholder="Extra directions for rider"
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
              placeholder="Create secure password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          {/* DOCUMENT UPLOAD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Verification Documents *
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload pharmacist license, CAC, NAFDAC, etc.
            </p>
          </div>

          {documents.length > 0 && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="font-medium mb-1">Uploaded documents:</p>
              <ul className="list-disc list-inside">
                {documents.map((doc, i) => (
                  <li key={i}>{doc.name}</li>
                ))}
              </ul>
            </div>
          )}

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