"use client";

import { useEffect, useState } from "react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  logoDataUrl?: string; // base64 preview
  hours?: string;
};

export default function PharmacySettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    logoDataUrl: "",
    hours: "Mon–Sat: 8am–6pm",
  });

  useEffect(() => {
    const saved = localStorage.getItem("pharmacyProfile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, logoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function save() {
    localStorage.setItem("pharmacyProfile", JSON.stringify(profile));
    alert("Saved settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Update your public profile & preferences.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: logo / preview */}
        <div className="bg-white rounded shadow p-5">
          <p className="font-semibold mb-3">Logo</p>
          {profile.logoDataUrl ? (
            <img src={profile.logoDataUrl} alt="logo" className="w-32 h-32 object-cover rounded mb-3" />
          ) : (
            <div className="w-32 h-32 bg-gray-100 grid place-items-center rounded mb-3 text-gray-500 text-xs">
              No logo
            </div>
          )}
          <input type="file" accept="image/*" onChange={onFile} />
        </div>

        {/* Middle: main info */}
        <div className="bg-white rounded shadow p-5 lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Pharmacy Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Campus Meds"
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="pharmacy@example.com"
              />
            </div>
            <div>
              <label className="text-sm">Phone</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+234 80 0000 0000"
              />
            </div>
            <div>
              <label className="text-sm">Address</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="FUTO North Gate"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Short Bio</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="We provide prescription meds, OTC, supplements and wellness support."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Opening Hours</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={profile.hours}
                onChange={(e) => setProfile({ ...profile, hours: e.target.value })}
                placeholder="Mon–Sat: 8am–6pm"
              />
            </div>
          </div>

          <div className="mt-4">
            <button onClick={save} className="bg-dark text-cream px-4 py-2 rounded hover:bg-green">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Security (placeholder) */}
      <div className="bg-white rounded shadow p-5">
        <p className="font-semibold mb-3">Security</p>
        <p className="text-sm text-gray-600 mb-2">Password reset and 2FA will be handled after backend integration.</p>
        <button className="px-3 py-2 rounded border hover:bg-gray-100 text-sm">Send password reset link</button>
      </div>
    </div>
  );
}