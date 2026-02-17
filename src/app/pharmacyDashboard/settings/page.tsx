"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type BusinessHours = {
  day: string;
  open: boolean;
  openingTime: string;
  closingTime: string;
};

type PharmacyProfile = {
  _id: string;
  name: string;
  pharmacyName: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  logoUrl: string;
  category: string;
  minOrder: number;
  businessHours: BusinessHours[];
  approved: boolean;
  ownerName?: string;
};

/* ================= CONSTANTS ================= */

const DAY_NAMES: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: "monday", open: true, openingTime: "08:00", closingTime: "18:00" },
  { day: "tuesday", open: true, openingTime: "08:00", closingTime: "18:00" },
  { day: "wednesday", open: true, openingTime: "08:00", closingTime: "18:00" },
  { day: "thursday", open: true, openingTime: "08:00", closingTime: "18:00" },
  { day: "friday", open: true, openingTime: "08:00", closingTime: "18:00" },
  { day: "saturday", open: true, openingTime: "08:00", closingTime: "14:00" },
  { day: "sunday", open: false, openingTime: "08:00", closingTime: "18:00" },
];

/* ================= PAGE ================= */

export default function PharmacySettingsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(""); // 👈 preview only
  const [logoBase64, setLogoBase64] = useState<string>("");   // 👈 upload only

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    async function loadProfile() {
      try {
        const auth = localStorage.getItem("pharmacyAuth");
        if (!auth) return router.push("/pharmacies/login");

        const { pharmacyId, _id } = JSON.parse(auth);
        const id = pharmacyId || _id;

        const res = await fetch(`/api/pharmacies/${id}/settings`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        setProfile({
          ...data,
          businessHours:
            Array.isArray(data.businessHours) && data.businessHours.length
              ? data.businessHours
              : DEFAULT_BUSINESS_HOURS,
        });

        setLogoPreview(data.logoUrl || "");
      } catch (err: any) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  /* ================= INPUT HANDLERS ================= */

  const updateField = (e: any) => {
    if (!profile) return;
    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: name === "minOrder" ? Number(value) : value,
    });
  };

  /* ================= LOGO ================= */

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    setLogoPreview(URL.createObjectURL(file));

    // Base64 for upload
    const reader = new FileReader();
    reader.onload = () => setLogoBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  /* ================= BUSINESS HOURS ================= */

  const updateHour = (
    day: string,
    field: keyof BusinessHours,
    value: string | boolean
  ) => {
    if (!profile) return;

    setProfile({
      ...profile,
      businessHours: profile.businessHours.map((h) =>
        h.day === day ? { ...h, [field]: value } : h
      ),
    });
  };

  /* ================= SAVE ================= */

  async function saveProfile() {
    if (!profile) return;

    try {
      setSaving(true);
      setMessage("");

      const auth = localStorage.getItem("pharmacyAuth");
      if (!auth) return router.push("/pharmacies/login");

      const { pharmacyId, _id } = JSON.parse(auth);
      const id = pharmacyId || _id;

      const res = await fetch(`/api/pharmacies/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          logoBase64: logoBase64 || undefined, // 👈 Cloudinary trigger
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setMessage("✓ Profile saved successfully");
      setLogoBase64("");
      router.refresh(); // 👈 FORCE SERVER REFETCH // reset after upload
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ================= STATES ================= */

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Loading…</div>;
  }

  if (!profile) {
    return <div className="min-h-screen grid place-items-center">Failed</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Pharmacy Settings</h1>

        {message && <div className="p-3 bg-white border rounded">{message}</div>}

        {/* LOGO */}
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold mb-3">Logo</p>
          {logoPreview ? (
            <img src={logoPreview} className="w-32 h-32 rounded object-cover mb-3" />
          ) : (
            <div className="w-32 h-32 bg-gray-100 grid place-items-center">🏥</div>
          )}
          <input type="file" accept="image/*" onChange={onFile} />
        </div>

        {/* INFO */}
        <div className="bg-white p-6 rounded shadow grid md:grid-cols-2 gap-4">
          <input name="pharmacyName" value={profile.pharmacyName} onChange={updateField} className="border p-3 rounded" />
          <input name="email" value={profile.email} onChange={updateField} className="border p-3 rounded" />
          <input name="phone" value={profile.phone} onChange={updateField} className="border p-3 rounded" />
          <input name="address" value={profile.address} onChange={updateField} className="border p-3 rounded" />
        </div>

        {/* HOURS */}
        <div className="bg-white p-6 rounded shadow space-y-3">
          <h3 className="font-bold">Business Hours</h3>

          {profile.businessHours.map((h) => (
            <div key={h.day} className="flex items-center gap-4">
              <input type="checkbox" checked={h.open} onChange={() => updateHour(h.day, "open", !h.open)} />
              <span className="w-24">{DAY_NAMES[h.day]}</span>
              {h.open ? (
                <>
                  <input type="time" value={h.openingTime} onChange={(e) => updateHour(h.day, "openingTime", e.target.value)} />
                  <input type="time" value={h.closingTime} onChange={(e) => updateHour(h.day, "closingTime", e.target.value)} />
                </>
              ) : (
                <span className="text-red-500">Closed</span>
              )}
            </div>
          ))}
        </div>

        <button onClick={saveProfile} disabled={saving} className="bg-dark text-cream px-6 py-3 rounded">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}