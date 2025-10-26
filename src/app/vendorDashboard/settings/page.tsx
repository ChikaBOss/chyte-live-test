"use client";

import { useEffect, useState } from "react";

type VendorProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  hours?: string;
  cuisine?: string;       // optional: what they’re known for
  logoDataUrl?: string;   // base64 preview (also maps legacy profileImage)
};

export default function VendorSettingsPage() {
  const [profile, setProfile] = useState<VendorProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    hours: "Mon–Sat: 8am–6pm",
    cuisine: "",
    logoDataUrl: "",
  });

  // Load existing profile (supports your old shape with profileImage)
  useEffect(() => {
    const savedRaw = localStorage.getItem("vendorProfile");
    if (!savedRaw) return;
    try {
      const saved = JSON.parse(savedRaw);
      setProfile((prev) => ({
        ...prev,
        name: saved.name ?? "",
        email: saved.email ?? "",
        phone: saved.phone ?? "",
        address: saved.address ?? "",
        bio: saved.bio ?? "",
        hours: saved.hours ?? prev.hours,
        cuisine: saved.cuisine ?? "",
        // map legacy key 'profileImage' -> logoDataUrl if present
        logoDataUrl: saved.logoDataUrl ?? saved.profileImage ?? "",
      }));
    } catch {
      // ignore malformed JSON
    }
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProfile((p) => ({ ...p, logoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function save() {
    localStorage.setItem("vendorProfile", JSON.stringify(profile));
    alert("Saved settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">
          Update your public vendor profile & preferences.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: logo / preview */}
        <div className="bg-white rounded shadow p-5">
          <p className="font-semibold mb-3">Logo / Profile Image</p>
          {profile.logoDataUrl ? (
            <img
              src={profile.logoDataUrl}
              alt="logo"
              className="w-32 h-32 object-cover rounded mb-3"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-100 grid place-items-center rounded mb-3 text-gray-500 text-xs">
              No image
            </div>
          )}
          <input type="file" accept="image/*" onChange={onFile} />
          <p className="text-xs text-gray-500 mt-2">
            PNG/JPG. Will appear on your profile and cards.
          </p>
        </div>

        {/* Middle/Right: main info */}
        <div className="bg-white rounded shadow p-5 lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Vendor Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="SEKANI"
              />
            </div>

            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="vendor@example.com"
              />
            </div>

            <div>
              <label className="text-sm">Phone</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+234 80 0000 0000"
              />
            </div>

            <div>
              <label className="text-sm">Address / Location</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                placeholder="FUTO South Gate"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm">Short Bio</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="We serve Abacha, soups & local meals daily. Fresh, fast, and affordable."
              />
            </div>

            <div>
              <label className="text-sm">Opening Hours</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.hours}
                onChange={(e) =>
                  setProfile({ ...profile, hours: e.target.value })
                }
                placeholder="Mon–Sat: 8am–6pm"
              />
            </div>

            <div>
              <label className="text-sm">Cuisine / Category (optional)</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.cuisine}
                onChange={(e) =>
                  setProfile({ ...profile, cuisine: e.target.value })
                }
                placeholder="Traditional • Grills • Shawarma"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={save}
              className="bg-dark text-cream px-4 py-2 rounded hover:bg-green"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Security (placeholder) */}
      <div className="bg-white rounded shadow p-5">
        <p className="font-semibold mb-3">Security</p>
        <p className="text-sm text-gray-600 mb-2">
          Password reset and 2FA will be handled after backend integration.
        </p>
        <button className="px-3 py-2 rounded border hover:bg-gray-100 text-sm">
          Send password reset link
        </button>
      </div>
    </div>
  );
}