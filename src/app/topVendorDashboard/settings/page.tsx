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

type TopVendorProfile = {
  _id: string;
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
  specialties?: string;
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

// Initial empty profile to prevent uncontrolled inputs
const initialProfileState: TopVendorProfile = {
  _id: "",
  businessName: "",
  email: "",
  phone: "",
  bio: "",
  address: "",
  logoUrl: "",
  category: "",
  minOrder: 0,
  businessHours: [],
  approved: false,
  ownerName: "",
  specialties: "",
  instagram: "",
  twitter: ""
};

export default function TopVendorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TopVendorProfile>(initialProfileState);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication first
  useEffect(() => {
    const checkAuth = () => {
      try {
        const auth = localStorage.getItem("topVendorAuth");
        if (!auth) {
          console.log("No topVendorAuth found in localStorage");
          setSaveMessage("Please log in to access settings");
          setLoading(false);
          return false;
        }

        const parsed = JSON.parse(auth);
        console.log("Parsed auth data:", parsed);
        
        // Check for vendor ID in various possible fields
        const vendorId = parsed.topVendorId || parsed._id || parsed.id || parsed.vendorId;
        
        if (!vendorId) {
          console.log("No vendor ID found in auth data. Available keys:", Object.keys(parsed));
          setSaveMessage("Invalid session. Please log in again.");
          setLoading(false);
          return false;
        }

        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Error checking auth:", error);
        setSaveMessage("Error checking authentication");
        setLoading(false);
        return false;
      }
    };

    if (!checkAuth()) {
      return;
    }
  }, []);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const auth = localStorage.getItem("topVendorAuth");
        if (!auth) {
          router.push("/topVendor/login");
          return;
        }

        const vendorData = JSON.parse(auth);
        console.log("Loading profile with vendorData:", vendorData);
        
        // Try multiple possible ID fields
        const vendorId = vendorData.topVendorId || vendorData._id || vendorData.id || vendorData.vendorId;
        
        if (!vendorId) {
          console.error("No vendor ID found in any field. Available keys:", Object.keys(vendorData));
          setSaveMessage("Unable to load profile: No vendor ID found");
          
          // Still try to populate form from localStorage
          setProfile({
            ...initialProfileState,
            businessName: vendorData.businessName || "",
            email: vendorData.email || "",
            phone: vendorData.phone || "",
            bio: vendorData.bio || "",
            address: vendorData.address || "",
            logoUrl: vendorData.logoUrl || "",
            category: vendorData.category || "",
            minOrder: vendorData.minOrder || 0,
            businessHours: vendorData.businessHours || [],
            approved: vendorData.approved || false,
            ownerName: vendorData.ownerName || "",
            specialties: vendorData.specialties || "",
            instagram: vendorData.instagram || "",
            twitter: vendorData.twitter || ""
          });
          return;
        }

        console.log("Using vendor ID:", vendorId);
        
        // Try to fetch from API, but don't fail if API is unavailable
        try {
          const response = await fetch("/api/top-vendor-settings", {
            headers: { 
              'x-top-vendor-id': vendorId
            }
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const profileData = await response.json();
              console.log("Loaded profile from API:", profileData);
              
              setProfile({
                ...initialProfileState,
                ...profileData,
                _id: profileData._id || vendorId,
                businessName: profileData.businessName || vendorData.businessName || "",
                email: profileData.email || vendorData.email || "",
                phone: profileData.phone || vendorData.phone || "",
                bio: profileData.bio || vendorData.bio || "",
                address: profileData.address || vendorData.address || "",
                logoUrl: profileData.logoUrl || vendorData.logoUrl || "",
                category: profileData.category || vendorData.category || "",
                minOrder: profileData.minOrder || vendorData.minOrder || 0,
                businessHours: profileData.businessHours || vendorData.businessHours || [],
                approved: profileData.approved || vendorData.approved || false,
                ownerName: profileData.ownerName || vendorData.ownerName || "",
                specialties: profileData.specialties || vendorData.specialties || "",
                instagram: profileData.instagram || vendorData.instagram || "",
                twitter: profileData.twitter || vendorData.twitter || ""
              });
              return;
            }
          }
        } catch (apiError) {
          console.log("API not available, using localStorage data:", apiError);
        }

        // Fallback to localStorage data
        setProfile({
          ...initialProfileState,
          _id: vendorId,
          businessName: vendorData.businessName || "",
          email: vendorData.email || "",
          phone: vendorData.phone || "",
          bio: vendorData.bio || "",
          address: vendorData.address || "",
          logoUrl: vendorData.logoUrl || "",
          category: vendorData.category || "",
          minOrder: vendorData.minOrder || 0,
          businessHours: vendorData.businessHours || [],
          approved: vendorData.approved || false,
          ownerName: vendorData.ownerName || "",
          specialties: vendorData.specialties || "",
          instagram: vendorData.instagram || "",
          twitter: vendorData.twitter || ""
        });

      } catch (error: any) {
        console.error("Error loading profile:", error);
        setSaveMessage("Error loading profile: " + error.message);
        
        // Try to at least show something from localStorage
        try {
          const auth = localStorage.getItem("topVendorAuth");
          if (auth) {
            const vendorData = JSON.parse(auth);
            setProfile({
              ...initialProfileState,
              businessName: vendorData.businessName || "",
              email: vendorData.email || "",
              phone: vendorData.phone || "",
              bio: vendorData.bio || "",
              address: vendorData.address || "",
              logoUrl: vendorData.logoUrl || "",
              category: vendorData.category || "",
              minOrder: vendorData.minOrder || 0,
              businessHours: vendorData.businessHours || [],
              approved: vendorData.approved || false,
              ownerName: vendorData.ownerName || "",
              specialties: vendorData.specialties || "",
              instagram: vendorData.instagram || "",
              twitter: vendorData.twitter || ""
            });
          }
        } catch (parseError) {
          console.error("Failed to parse localStorage:", parseError);
        }
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, router]);

  // Handle image upload
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

  // Save profile
  async function saveProfile() {
    setSaving(true);
    setSaveMessage("");
    
    try {
      // Get vendor ID from profile or localStorage
      let vendorId = profile._id;
      
      if (!vendorId) {
        // Try to get from localStorage
        const auth = localStorage.getItem("topVendorAuth");
        if (auth) {
          const vendorData = JSON.parse(auth);
          vendorId = vendorData.topVendorId || vendorData._id || vendorData.id || vendorData.vendorId;
        }
      }

      if (!vendorId) {
        setSaveMessage("✗ Cannot save: No vendor ID found. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem("topVendorAuth");
          router.push("/topVendor/login");
        }, 2000);
        return;
      }

      // Prepare data to send
      const dataToSend = {
        businessName: profile.businessName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        address: profile.address || "",
        logoUrl: profile.logoUrl || "",
        category: profile.category || "",
        minOrder: profile.minOrder || 0,
        instagram: profile.instagram || "",
        twitter: profile.twitter || "",
        specialties: profile.specialties || "",
        ownerName: profile.ownerName || "",
        businessHours: profile.businessHours || []
      };

      console.log("Saving to /api/top-vendor-settings with ID:", vendorId);
      
      try {
        const response = await fetch("/api/top-vendor-settings", {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'x-top-vendor-id': vendorId
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Save successful:", responseData);
          
          // Update localStorage with new data
          const auth = localStorage.getItem("topVendorAuth");
          if (auth) {
            const vendorData = JSON.parse(auth);
            const updatedAuth = { 
              ...vendorData, 
              ...dataToSend,
              _id: vendorId,
              topVendorId: vendorId
            };
            localStorage.setItem("topVendorAuth", JSON.stringify(updatedAuth));
          }
          
          setSaveMessage("✓ Profile saved successfully!");
        } else {
          throw new Error(`Failed to save: ${response.status}`);
        }
      } catch (apiError) {
        console.log("API save failed, saving to localStorage only:", apiError);
        
        // Save to localStorage as fallback
        const auth = localStorage.getItem("topVendorAuth");
        if (auth) {
          const vendorData = JSON.parse(auth);
          const updatedAuth = { 
            ...vendorData, 
            ...dataToSend,
            _id: vendorId,
            topVendorId: vendorId
          };
          localStorage.setItem("topVendorAuth", JSON.stringify(updatedAuth));
        }
        
        setSaveMessage("✓ Profile saved locally (API unavailable)");
      }
      
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
    const { name, value, type } = e.target;
    
    setProfile(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : (value || "")
    }));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("topVendorAuth");
    router.push("/topVendor/login");
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

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Top Vendor Settings</h1>
            <p className="text-dark/70">Manage your profile and business hours</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-dark rounded-lg hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes("✓") ? "bg-green-100 border border-green-400 text-green-800" : "bg-red-100 border border-red-400 text-red-800"}`}>
            {saveMessage}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-dark mb-4">Authentication Required</h2>
            <p className="text-dark/70 mb-6">Please log in to access vendor settings</p>
            <button
              onClick={() => router.push("/topVendor/login")}
              className="bg-green text-cream px-6 py-3 rounded-lg font-semibold hover:bg-dark transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
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
                      <span className="text-4xl text-green">⭐</span>
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
                      value={profile.minOrder}
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
                      value={profile.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select category</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Cafe</option>
                      <option value="bakery">Bakery</option>
                      <option value="grocery">Grocery Store</option>
                      <option value="butchery">Butchery</option>
                      <option value="supermarket">Supermarket</option>
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
                      value={profile.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Owner Name</label>
                    <input
                      name="ownerName"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={profile.ownerName}
                      onChange={handleInputChange}
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
                      value={profile.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-dark font-medium mb-2">Specialties</label>
                    <input
                      name="specialties"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={profile.specialties}
                      onChange={handleInputChange}
                      placeholder="e.g., Organic Products, Fresh Meats, Imported Goods"
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
                      value={profile.bio}
                      onChange={handleInputChange}
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
                      />
                    </div>

                    <div>
                      <label className="block text-dark font-medium mb-2">Twitter</label>
                      <input
                        name="twitter"
                        className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                        value={profile.twitter}
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
        )}
      </div>
    </div>
  );
}