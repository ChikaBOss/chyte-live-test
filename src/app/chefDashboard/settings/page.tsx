"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type ChefProfile = {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  experience: string;
  specialties: string;
  avatarUrl: string;
  instagram?: string;
  twitter?: string;
  preparationTime: number;
  minOrder: number;
};

export default function ChefSettingsPage() {
  const [profile, setProfile] = useState<ChefProfile>({
    displayName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    experience: "",
    specialties: "",
    avatarUrl: "",
    instagram: "",
    twitter: "",
    preparationTime: 30,
    minOrder: 1000,
  });

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chefProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Handle image upload
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setProfile((p) => ({ ...p, avatarUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  // Remove profile image
  function removeImage() {
    setProfile((p) => ({ ...p, avatarUrl: "" }));
  }

  // Save profile
  async function saveProfile() {
    setSaving(true);
    try {
      localStorage.setItem("chefProfile", JSON.stringify(profile));
      setSaveMessage("Profile saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Chef Settings</h1>
          <p className="text-dark/70">Manage your profile and preferences</p>
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
                  <label className="block text-dark font-medium mb-2">Preparation Time (minutes)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.preparationTime}
                    onChange={handleInputChange}
                    min="10"
                    max="120"
                  />
                </div>

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
                    value={profile.experience}
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

          {/* Right Column - Main Profile Info */}
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
                    value={profile.displayName}
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
                    name="location"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.location}
                    onChange={handleInputChange}
                    placeholder="FUTO South Gate, Ihiagwa"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-dark font-medium mb-2">Specialties *</label>
                  <input
                    name="specialties"
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                    value={profile.specialties}
                    onChange={handleInputChange}
                    placeholder="Grilled chicken, suya rice, pepper soup"
                  />
                </div>
              </div>
            </motion.div>

            {/* Bio & Social Media Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">Bio & Social Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-dark font-medium mb-2">Short Bio *</label>
                  <textarea
                    name="bio"
                    rows={4}
                    className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green resize-none"
                    value={profile.bio}
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
                      value={profile.instagram}
                      onChange={handleInputChange}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Twitter</label>
                    <input
                      name="twitter"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={profile.twitter}
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
              transition={{ delay: 0.2 }}
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

            {/* Security Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">Security</h3>
              
              <div className="space-y-4">
                <p className="text-dark/70">
                  Password reset and two-factor authentication will be available after backend integration.
                </p>
                
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-dark/20 text-dark rounded-xl font-medium hover:bg-dark/10 transition-colors">
                    Send Password Reset Link
                  </button>
                  
                  <button className="px-4 py-2 border border-dark/20 text-dark rounded-xl font-medium hover:bg-dark/10 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}