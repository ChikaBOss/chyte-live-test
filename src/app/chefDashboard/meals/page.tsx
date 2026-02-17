"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/image-compression"; // Import the utility

type Meal = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string; // <-- changed to imageUrl
  description: string;
  available: boolean;
  preparationTime: number;
  ingredients: string[];
  serves: number;
  createdAt: string;
};

export default function ChefMealsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"meals" | "orders">("meals");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Meal form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [preparationTime, setPreparationTime] = useState<number | "">("");
  const [ingredients, setIngredients] = useState("");
  const [available, setAvailable] = useState(true);
  const [serves, setServes] = useState<number | "">(1);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [uploading, setUploading] = useState(false);

  // previewRef to manage object URL lifecycle deterministically
  const previewRef = useRef<string | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewRef.current && previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // revoke previous preview URL (if any)
    if (previewRef.current && previewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setImageFile(file);

    if (file) {
      // simple size validation (5MB)
      const MAX_MB = 5;
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`Image too large. Please use an image smaller than ${MAX_MB}MB.`);
        setImagePreview(null);
        setImageFile(null);
        return;
      }

      // Create preview URL (blob)
      const previewUrl = URL.createObjectURL(file);
      previewRef.current = previewUrl;
      setImagePreview(previewUrl);
      console.log("📸 Image selected:", file.name, "Size:", (file.size / 1024).toFixed(2), "KB");
    } else {
      setImagePreview(null);
    }
  };

  // Load meals on component mount (with abort support)
  useEffect(() => {
    const ac = new AbortController();
    async function loadMeals() {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Loading meals...");

        const response = await fetch("/api/meals", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          signal: ac.signal,
        });

        console.log("📡 Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Meals loaded:", Array.isArray(data) ? data.length : 0);
          setMeals(Array.isArray(data) ? data : []);
        } else {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (err) {
            console.error("❌ Failed to parse error body", err);
          }
          console.error("❌ Error loading meals:", errorData);
          setError((errorData as any).error || "Failed to load meals");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🔁 loadMeals aborted");
        } else {
          console.error("❌ Network error:", err);
          setError("Network error. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      loadMeals();
    }

    return () => ac.abort();
  }, [status]);

  // Reset form
  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setImageFile(null);

    // Clean up preview URL if it's a blob
    if (previewRef.current && previewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setImagePreview(null);

    setDescription("");
    setPreparationTime("");
    setIngredients("");
    setAvailable(true);
    setServes(1);
    setEditingMeal(null);
    setError(null);
  }, []);

  // Helper: upload base64/data URL to server and get hosted URL
  async function uploadBase64Image(dataUrl: string) {
    // Note: you must implement /api/upload-image to accept { image: string } and return { url: string }
    const res = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errText}`);
    }

    const json = await res.json();
    if (!json?.url) throw new Error("Upload endpoint did not return a url");
    return json.url as string;
  }

  // Save or update meal with improved error handling
  async function saveMeal() {
    if (!name.trim()) {
      setError("Meal name is required");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Valid price is required");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      let imageUrl = "";
      if (imageFile) {
        console.log("🖼️ Compressing image...");
        let compressed: string | undefined;
        try {
          compressed = await compressImage(imageFile); // may return data:, http(s) url, or throw
          console.log("✅ Compression result length:", compressed ? compressed.length : "none");
        } catch (compressionError) {
          console.error("Image compression failed:", compressionError);
          setError("Failed to process image. Please try another image.");
          setUploading(false);
          return;
        }

        // If compressImage returns a full http(s) url, use it directly
        if (compressed && (compressed.startsWith("http://") || compressed.startsWith("https://"))) {
          imageUrl = compressed;
        } else if (compressed && compressed.startsWith("data:")) {
          // data:image/...;base64,<data> -> upload to server
          try {
            imageUrl = await uploadBase64Image(compressed);
            console.log("✅ Image uploaded and hosted at:", imageUrl);
          } catch (uploadErr) {
            console.error("Image upload failed:", uploadErr);
            setError("Failed to upload image. Please try again.");
            setUploading(false);
            return;
          }
        } else if (compressed && compressed.startsWith("blob:")) {
          // blob URL returned (unlikely) — we should upload the original file instead
          // fallback: upload original file as base64 using FileReader
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(imageFile);
          });
          try {
            imageUrl = await uploadBase64Image(base64);
          } catch (uploadErr) {
            console.error("Fallback upload failed:", uploadErr);
            setError("Failed to upload image. Please try again.");
            setUploading(false);
            return;
          }
        } else {
          // Unknown return type — attempt to upload original file as base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(imageFile);
          });
          try {
            imageUrl = await uploadBase64Image(base64);
          } catch (uploadErr) {
            console.error("Upload failed:", uploadErr);
            setError("Failed to upload image. Please try again.");
            setUploading(false);
            return;
          }
        }
      } else if (editingMeal?.imageUrl) {
        // <-- read existing imageUrl from editingMeal
        imageUrl = editingMeal.imageUrl ?? "";
      }

      const mealData = {
        name: name.trim(),
        price: Number(price),
        imageUrl: imageUrl, // <-- send imageUrl (not image)
        description: description.trim(),
        preparationTime: Number(preparationTime) || 30,
        ingredients: ingredients
          ? ingredients.split(",").map((i) => i.trim()).filter((i) => i)
          : [],
        available,
        serves: Number(serves) || 1,
      };

      console.log("📤 Sending meal data...", {
        hasImage: !!imageUrl,
        imageLength: imageUrl?.length,
        editing: !!editingMeal,
        mealData: {
          ...mealData,
          imageUrl: imageUrl ? `[IMG_URL: ${imageUrl}]` : "No image",
        },
      });

      const url = editingMeal ? `/api/meals/${editingMeal._id}` : "/api/meals";
      const method = editingMeal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });

      console.log("📥 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      let responseData: any = {};
      try {
        // prefer json()
        responseData = await response.json().catch(async () => {
          const text = await response.text();
          console.warn("⚠️ Non-JSON response:", text.substring(0, 200));
          return {};
        });
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        responseData = {};
      }

      if (response.ok) {
        console.log("✅ Meal saved successfully:", responseData);

        if (editingMeal) {
          setMeals((prev) => prev.map((m) => (m._id === editingMeal._id ? responseData : m)));
        } else {
          setMeals((prev) => [responseData, ...prev]);
        }

        resetForm();
        alert(editingMeal ? "Meal updated successfully!" : "Meal added successfully!");
      } else {
        console.error("❌ Save failed with status", response.status, ":", responseData);
        setError(
          responseData.error ||
            responseData.details ||
            responseData.message ||
            `Failed to save meal (Status: ${response.status})`
        );
      }
    } catch (err) {
      console.error("❌ Network/Fetch error:", err);
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  // Test API endpoint function
  async function testApiEndpoint() {
    try {
      console.log("🧪 Testing API endpoint...");

      // Test GET request
      const getResponse = await fetch("/api/meals");
      console.log("GET test:", {
        status: getResponse.status,
        ok: getResponse.ok,
      });

      // Test POST with minimal data
      const testData = {
        name: "Test Meal " + Date.now(),
        price: 1000,
        imageUrl: "", // <-- use imageUrl
        description: "Test description",
        preparationTime: 30,
        ingredients: ["test"],
        available: true,
        serves: 1,
      };

      const postResponse = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const postResult = await postResponse.json();
      console.log("POST test:", {
        status: postResponse.status,
        ok: postResponse.ok,
        response: postResult,
      });
    } catch (error) {
      console.error("🧪 API test failed:", error);
    }
  }

  // Edit meal
  function editMeal(meal: Meal) {
    // Clean up previous preview URL
    if (previewRef.current && previewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setEditingMeal(meal);
    setName(meal.name);
    setPrice(meal.price);
    setDescription(meal.description);
    setPreparationTime(meal.preparationTime);
    setIngredients(meal.ingredients.join(", "));
    setAvailable(meal.available);
    setServes(meal.serves);
    setImageFile(null);
    setImagePreview(meal.imageUrl || null); // <-- use imageUrl
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete meal
  async function deleteMeal(mealId: string) {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMeals((prev) => prev.filter((m) => m._id !== mealId));
        alert("Meal deleted successfully!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert((errorData as any).error || "Failed to delete meal");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting meal");
    } finally {
      setLoading(false);
    }
  }

  // Toggle availability
  async function toggleAvailability(mealId: string) {
    const meal = meals.find((m) => m._id === mealId);
    if (!meal) return;

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !meal.available }),
      });

      if (response.ok) {
        const updatedMeal = await response.json();
        setMeals((prev) => prev.map((m) => (m._id === mealId ? updatedMeal : m)));
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  }

  // Refresh meals
  const refreshMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meals", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Test save without image
  async function testSaveWithoutImage() {
    const testMeal = {
      name: "Test Meal " + Date.now(),
      price: 1500,
      imageUrl: "", // <-- use imageUrl
      description: "Test description",
      preparationTime: 30,
      ingredients: ["test"],
      available: true,
      serves: 2,
    };

    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testMeal),
      });

      const result = await response.json();
      console.log("Test save result:", result);
      return result;
    } catch (error) {
      console.error("Test save failed:", error);
    }
  }

  // Render loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render unauthorized
  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chef Dashboard</h1>
          <p className="text-gray-600">Manage your meals and services</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug buttons - remove in production */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={testApiEndpoint}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            Test API
          </button>
          <button
            onClick={testSaveWithoutImage}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            Test Save (no image)
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "meals" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("meals")}
          >
            Meals ({meals.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "orders" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        {activeTab === "meals" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Meal Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{editingMeal ? "Edit Meal" : "Add New Meal"}</h2>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter meal name"
                    disabled={uploading}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter price"
                    min="0"
                    step="100"
                    disabled={uploading}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={uploading}
                  />

                  {/* Image Preview (for local blob/data) */}
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                        {/* Use plain img for blob/data preview */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="object-cover w-full h-full"
                          onLoad={() => {
                            // optional: revoke blob url a bit after load, but keep ref for deterministic revoke
                            if (previewRef.current && previewRef.current.startsWith("blob:")) {
                              setTimeout(() => {
                                // we don't revoke here to avoid race - main cleanup is handled by previewRef
                                // but if you want aggressive cleanup uncomment the next lines:
                                // URL.revokeObjectURL(previewRef.current as string);
                                // previewRef.current = null;
                              }, 1000);
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Tip: Large images will be automatically compressed to 800x800px</p>
                    </div>
                  )}

                  {/* Existing Image when Editing */}
                  {editingMeal?.imageUrl && !imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                        {/* next/image OK for hosted remote images */}
                        <Image src={editingMeal.imageUrl} alt="Current meal" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your meal..."
                    disabled={uploading}
                  />
                </div>

                {/* Prep Time & Serves */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (minutes)</label>
                    <input
                      type="number"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                      min="0"
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serves (people)</label>
                    <input
                      type="number"
                      value={serves}
                      onChange={(e) => setServes(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2"
                      min="1"
                      disabled={uploading}
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="rice, chicken, tomatoes, peppers"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate ingredients with commas</p>
                </div>

                {/* Availability */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={uploading}
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                    Available for order
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveMeal}
                    disabled={uploading || !name.trim() || !price}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : editingMeal ? "Update Meal" : "Add Meal"}
                  </button>

                  {editingMeal && (
                    <button
                      onClick={resetForm}
                      disabled={uploading}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Meals List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Meals</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {meals.filter((m) => m.available).length} available • {meals.length} total
                  </p>
                </div>
                <button
                  onClick={refreshMeals}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading meals...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && meals.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No meals yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add your first meal using the form</p>
                </div>
              )}

              {/* Meals List */}
              {!loading && meals.length > 0 && (
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <motion.div key={meal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {/* Meal Image */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                            {meal.imageUrl ? (
                              <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" sizes="80px" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meal Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 truncate">{meal.name}</h3>
                              <p className="text-blue-600 font-bold mt-1">₦{meal.price.toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${meal.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {meal.available ? "Available" : "Unavailable"}
                            </span>
                          </div>

                          {meal.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{meal.description}</p>}

                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                            {meal.preparationTime > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {meal.preparationTime} min
                              </span>
                            )}
                            {meal.serves > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                Serves {meal.serves}
                              </span>
                            )}
                            {meal.ingredients.length > 0 && (
                              <span className="truncate max-w-[120px]">
                                {meal.ingredients.slice(0, 2).join(", ")}
                                {meal.ingredients.length > 2 && "..."}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1">
                          <button onClick={() => editMeal(meal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleAvailability(meal._id)}
                            className={`p-2 rounded-lg transition-colors ${meal.available ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                            title={meal.available ? "Mark unavailable" : "Mark available"}
                          >
                            {meal.available ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button onClick={() => deleteMeal(meal._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Orders Tab */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Orders</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Orders Coming Soon</p>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                You'll be able to view and manage customer orders here. Track orders, update statuses, and manage deliveries.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}