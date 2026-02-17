"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

type BusinessHours = {
  day: string;
  open: boolean;
  openingTime: string;
  closingTime: string;
};

type ChefProfile = {
  _id: string;
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  experience: string;
  specialties: string;
  avatarUrl: string;
  instagram?: string;
  twitter?: string;
  minOrder: number;
  businessHours: BusinessHours[];
  businessName: string;
  approved: boolean;
  ownerName?: string;
  category?: string;
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

export default function ChefSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load profile from database
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const auth = localStorage.getItem("chefAuth");
        if (!auth) {
          router.push("/chefs/login");
          return;
        }

        const chefData = JSON.parse(auth);
        const response = await fetch("/api/chef-settings", { // ← CHANGED THIS LINE
          headers: {
            'x-chef-id': chefData._id
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const profileData = await response.json();
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
        setSaveMessage("Error loading profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Handle image upload
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    // Convert to base64 for now - in production, upload to cloud storage
    const reader = new FileReader();
    reader.onload = () => {
      if (profile) {
        setProfile({ ...profile, avatarUrl: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  }

  // Remove profile image
  function removeImage() {
    if (profile) {
      setProfile({ ...profile, avatarUrl: "" });
    }
  }

  // Save profile to database
  async function saveProfile() {
    if (!profile) return;

    setSaving(true);
    try {
      const auth = localStorage.getItem("chefAuth");
      if (!auth) {
        router.push("/chefs/login");
        return;
      }

      const chefData = JSON.parse(auth);
      const response = await fetch("/api/chef-settings", { // ← CHANGED THIS LINE
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'x-chef-id': chefData._id
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      const result = await response.json();
      
      // Update localStorage with new profile data
      localStorage.setItem("chefAuth", JSON.stringify(result.chef));
      
      setSaveMessage("Profile saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSaveMessage(error.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!profile) return;
    
    const { name, value } = e.target;
    setProfile(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

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
            onClick={() => window.location.reload()}
            className="mt-4 bg-green text-cream px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Chef Settings</h1>
          <p className="text-dark/70">Manage your profile and business hours</p>
          {!profile.approved && (
            <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Your account is pending approval. You can still set up your profile.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Picture & Business Settings */}
          <div className="space-y-6">
            {/* Profile Picture Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">Profile Picture</h3>
              
              <div className="flex flex-col items-center">
                {profile.avatarUrl ? (
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green/20">
                      <Image
                        src={profile.avatarUrl}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-green/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl text-green">👨‍🍳</span>
                  </div>
                )}
                
                <div className="text-center">
                  <label className="block bg-green text-cream px-4 py-2 rounded-xl font-semibold hover:bg-dark transition-colors cursor-pointer mb-2">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFile}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-dark/60">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </motion.div>

            {/* Business Settings Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">Business Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Minimum Order (₦)</label>
                  <input
                    type="number"
                    name="minOrder"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.minOrder}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Experience Level</label>
                  <select
                    name="experience"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.experience || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Main Profile Info & Business Hours */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">Personal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Display Name *</label>
                  <input
                    name="displayName"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.displayName || ''}
                    onChange={handleInputChange}
                    placeholder="Chef Amarachi"
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
                    placeholder="chef@example.com"
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Phone *</label>
                  <input
                    name="phone"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.phone}
                    onChange={handleInputChange}
                    placeholder="+234 80 0000 0000"
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Location *</label>
                  <input
                    name="address"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.address || ''}
                    onChange={handleInputChange}
                    placeholder="FUTO South Gate, Ihiagwa"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-dark font-medium mb-2">Specialties *</label>
                  <input
                    name="specialties"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.specialties || ''}
                    onChange={handleInputChange}
                    placeholder="Grilled chicken, suya rice, pepper soup"
                  />
                </div>
              </div>
            </motion.div>

            {/* Business Hours Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-dark">Business Hours</h3>
                <button
                  onClick={() => {
                    const openingTime = prompt("Enter opening time (HH:MM):", "09:00");
                    const closingTime = prompt("Enter closing time (HH:MM):", "22:00");
                    if (openingTime && closingTime) {
                      applyToAllDays(openingTime, closingTime);
                    }
                  }}
                  className="text-sm bg-green text-cream px-3 py-1 rounded-lg hover:bg-dark transition-colors"
                >
                  Apply to All Open Days
                </button>
              </div>
              
              <div className="space-y-3">
                {profile.businessHours.map((hours) => (
                  <div key={hours.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleDay(hours.day)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          hours.open ? 'bg-green' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            hours.open ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="font-medium min-w-24">{dayNames[hours.day]}</span>
                    </div>
                    
                    {hours.open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={hours.openingTime}
                          onChange={(e) => handleBusinessHoursChange(hours.day, 'openingTime', e.target.value)}
                          className="border border-dark/20 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green"
                        />
                        <span className="text-dark/60">to</span>
                        <input
                          type="time"
                          value={hours.closingTime}
                          onChange={(e) => handleBusinessHoursChange(hours.day, 'closingTime', e.target.value)}
                          className="border border-dark/20 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green"
                        />
                      </div>
                    ) : (
                      <span className="text-red-500 font-medium flex-1">Closed</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 Customers will only be able to place orders during your open hours. 
                  Make sure to set accurate times for each day.
                </p>
              </div>
            </motion.div>

            {/* Bio & Social Media Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">Bio & Social Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Short Bio *</label>
                  <textarea
                    name="bio"
                    rows={4}
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green resize-none"
                    value={profile.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Tell customers about your cooking style, background, and what makes your food special..."
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
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Twitter</label>
                    <input
                      name="twitter"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={profile.twitter || ''}
                      onChange={handleInputChange}
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  {saveMessage && (
                    <p className={`font-medium ${
                      saveMessage.includes("Error") ? "text-red-500" : "text-green"
                    }`}>
                      {saveMessage}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-green text-cream px-8 py-3 rounded-xl font-semibold hover:bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}