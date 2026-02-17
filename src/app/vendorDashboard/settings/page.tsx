"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type BusinessHours = {
  day: string;
  open: boolean;
  openingTime: string;
  closingTime: string;
};

type VendorProfile = {
  _id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  logoUrl: string;
  instagram?: string;
  twitter?: string;
  category: string;
  minOrder: number;
  businessHours: BusinessHours[];
  approved: boolean;
  ownerName?: string;
  cuisine?: string;
};

const dayNames: { [key: string]: string } = {
  monday: "Monday",
  tuesday: "Tuesday", 
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function VendorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const auth = localStorage.getItem("vendorAuth");
        if (!auth) {
          router.push("/vendors/login");
          return;
        }

        const vendorData = JSON.parse(auth);
        const response = await fetch("/api/vendor-settings", {
          headers: { 'x-vendor-id': vendorData.vendorId || vendorData._id }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to load profile');
        }

        const profileData = await response.json();
        console.log("Loaded profile:", profileData);
        setProfile(profileData);
      } catch (error: any) {
        console.error("Error loading profile:", error);
        setSaveMessage("Error loading profile: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Handle image upload - SIMPLE VERSION
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    setUploadingLogo(true);
    
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      console.log("Base64 created, length:", base64.length);
      
      // Update profile
      setProfile({ ...profile, logoUrl: base64 });
      
      setSaveMessage("✓ Logo ready to save");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (error) {
      console.error("Error processing image:", error);
      setSaveMessage("✗ Failed to process image");
    } finally {
      setUploadingLogo(false);
    }
  }

  // Remove logo
  function removeImage() {
    if (profile) {
      setProfile({ ...profile, logoUrl: "" });
      setSaveMessage("Logo removed");
    }
  }

  // Save profile - SIMPLE VERSION
  async function saveProfile() {
    if (!profile) return;

    setSaving(true);
    setSaveMessage("");
    
    try {
      const auth = localStorage.getItem("vendorAuth");
      if (!auth) {
        router.push("/vendors/login");
        return;
      }

      const vendorData = JSON.parse(auth);
      const vendorId = vendorData.vendorId || vendorData._id;
      
      console.log("Saving vendor profile for ID:", vendorId);
      console.log("Logo URL type:", profile.logoUrl?.startsWith('data:') ? 'base64' : 'url');

      // Prepare data to send
      const dataToSend = {
        name: profile.name,
        businessName: profile.businessName,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        address: profile.address,
        logoUrl: profile.logoUrl || "", // Send empty string if no logo
        category: profile.category,
        minOrder: profile.minOrder,
        instagram: profile.instagram || "",
        twitter: profile.twitter || "",
        cuisine: profile.cuisine || "",
        businessHours: profile.businessHours
      };

      const response = await fetch("/api/vendor-settings", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'x-vendor-id': vendorId
        },
        body: JSON.stringify(dataToSend)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Server error:", responseData);
        throw new Error(responseData.error || `Failed to save (${response.status})`);
      }

      // Update localStorage if needed
      if (responseData.vendor) {
        const newAuth = { ...vendorData, ...responseData.vendor };
        localStorage.setItem("vendorAuth", JSON.stringify(newAuth));
      }
      
      setSaveMessage("✓ Profile saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSaveMessage("✗ " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!profile) return;
    
    const { name, value } = e.target;
    setProfile(prev => prev ? {
      ...prev,
      [name]: name === "minOrder" ? Number(value) : value
    } : null);
  };

  // Business hours handlers
  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    if (!profile) return;
    
    setProfile(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        businessHours: prev.businessHours.map(hour => 
          hour.day === day ? { ...hour, [field]: value } : hour
        )
      };
    });
  };

  const toggleDay = (day: string) => {
    handleBusinessHoursChange(day, 'open', !profile?.businessHours.find(h => h.day === day)?.open);
  };

  const applyToAllDays = (openingTime: string, closingTime: string) => {
    if (!profile) return;
    
    const updatedHours = profile.businessHours.map(hour => 
      hour.open ? { ...hour, openingTime, closingTime } : hour
    );
    
    setProfile({ ...profile, businessHours: updatedHours });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
          <p className="text-dark">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark">Failed to load profile</p>
          <button 
            onClick={() => router.push("/vendors/login")}
            className="mt-4 bg-green text-cream px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Vendor Settings</h1>
          <p className="text-dark/70">Manage your profile and business hours</p>
        </div>

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes("✓") ? "bg-green-100 border border-green-400 text-green-800" : "bg-red-100 border border-red-400 text-red-800"}`}>
            {saveMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Logo Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Business Logo</h3>
              
              <div className="flex flex-col items-center">
                {profile.logoUrl ? (
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green/20">
                      <img
                        src={profile.logoUrl}
                        alt="Logo"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={uploadingLogo}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-green/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl text-green">🏪</span>
                  </div>
                )}
                
                <div className="text-center">
                  <label className={`block ${uploadingLogo ? 'bg-gray-400' : 'bg-green hover:bg-dark'} text-cream px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer mb-2 ${uploadingLogo ? 'cursor-not-allowed' : ''}`}>
                    {uploadingLogo ? "Processing..." : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFile}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                  <p className="text-xs text-dark/60">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Business Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Business Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Minimum Order (₦)</label>
                  <input
                    type="number"
                    name="minOrder"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.minOrder || 0}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.category || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select category</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="food-truck">Food Truck</option>
                    <option value="catering">Catering</option>
                    <option value="bakery">Bakery</option>
                    <option value="grocery">Grocery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Business Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Business Name *</label>
                  <input
                    name="businessName"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.businessName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Contact Person *</label>
                  <input
                    name="name"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Phone *</label>
                  <input
                    name="phone"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-dark font-medium mb-2">Address *</label>
                  <input
                    name="address"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.address || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-dark font-medium mb-2">Cuisine / Specialties</label>
                  <input
                    name="cuisine"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.cuisine || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Bio & Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Business Bio & Social Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Business Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green resize-none"
                    value={profile.bio || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark font-medium mb-2">Instagram</label>
                    <input
                      name="instagram"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={profile.instagram || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Twitter</label>
                    <input
                      name="twitter"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={profile.twitter || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  {saveMessage && (
                    <p className={`font-medium ${saveMessage.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                      {saveMessage}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-green text-cream px-8 py-3 rounded-xl font-semibold hover:bg-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}