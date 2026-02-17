"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type FoodItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  ingredients: string[];
  preparationTime: number;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
};

/* ================= PAGE ================= */

export default function TopVendorProductsPage() {
  const router = useRouter();
  
  // 🔐 Top Vendor auth
  const [topVendorAuth, setTopVendorAuth] = useState<{ 
    topVendorId: string; 
    businessName?: string;
    email?: string;
  } | null>(null);

  /* ================= STATE ================= */

  const [products, setProducts] = useState<FoodItem[]>([]);
  const [editing, setEditing] = useState<FoodItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparationTime, setPreparationTime] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  // Loading & error state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ================= AUTHENTICATION ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const auth = localStorage.getItem("topVendorAuth");
  
    if (!auth) {
      router.replace("/topVendor/login");
      return;
    }
  
    try {
      const parsed = JSON.parse(auth);
  
      // 🔥 NORMALIZE ID (THIS IS THE FIX)
      const resolvedTopVendorId =
        parsed.topVendorId ||
        parsed._id ||
        parsed.id ||
        parsed.vendorId;
  
      if (!resolvedTopVendorId) {
        console.error("Invalid topVendorAuth object:", parsed);
        localStorage.removeItem("topVendorAuth");
        router.replace("/topVendor/login");
        return;
      }
  
      setTopVendorAuth({
        topVendorId: resolvedTopVendorId,
        businessName: parsed.businessName,
        email: parsed.email,
      });
    } catch (err) {
      console.error("Failed to parse top vendor auth:", err);
      localStorage.removeItem("topVendorAuth");
      router.replace("/topVendor/login");
    }
  }, [router]);

  /* ================= LOAD PRODUCTS ================= */

  const loadProducts = useCallback(async () => {
    if (!topVendorAuth?.topVendorId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/top-vendor-products?topVendorId=${topVendorAuth.topVendorId}`,
        { 
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to load food items");
      }
    } catch (err: any) {
      console.error("Load error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [topVendorAuth]);

  useEffect(() => {
    if (topVendorAuth?.topVendorId) {
      loadProducts();
    }
  }, [topVendorAuth, loadProducts]);

  /* ================= IMAGE HANDLING ================= */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // Clean up previous URL
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setImageFile(file);
    setError(null);

    if (file) {
      // Size validation (5MB)
      const MAX_MB = 5;
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`Image too large. Please use an image smaller than ${MAX_MB}MB.`);
        setImagePreview(null);
        setImageFile(null);
        return;
      }

      const preview = URL.createObjectURL(file);
      previewRef.current = preview;
      setImagePreview(preview);
    } else {
      setImagePreview(null);
    }
  };

  async function uploadBase64Image(dataUrl: string): Promise<string> {
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
    return json.url;
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ================= FORM MANAGEMENT ================= */

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setIngredients("");
    setPreparationTime("");
    setIsAvailable(true);
    setIsFeatured(false);
    
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    
    setImageFile(null);
    setImagePreview(null);
    setEditing(null);
    setError(null);
    setSuccess(null);
  }, []);

  const editProduct = (product: FoodItem) => {
    setEditing(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setIngredients(product.ingredients.join(", "));
    setPreparationTime(product.preparationTime);
    setIsAvailable(product.isAvailable);
    setIsFeatured(product.isFeatured);
    setImagePreview(product.imageUrl || null);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= SAVE PRODUCT ================= */

  const saveProduct = async () => {
    if (!name.trim()) {
      setError("Food item name is required");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Valid price is required");
      return;
    }

    if (!topVendorAuth?.topVendorId) {
      setError("Vendor authentication required");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      let imageUrl = "";
      if (imageFile) {
        // For top vendor, you might want to add image compression here
        // For now, using direct upload
        const base64 = await fileToBase64(imageFile);
        imageUrl = await uploadBase64Image(base64);
      } else if (editing?.imageUrl) {
        imageUrl = editing.imageUrl;
      }

      const payload = {
        topVendorId: topVendorAuth.topVendorId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        ingredients: ingredients.split(",").map(i => i.trim()).filter(i => i),
        preparationTime: Number(preparationTime) || 0,
        isAvailable,
        isFeatured,
        imageUrl,
      };

      const url = editing ? `/api/top-vendor-products/${editing._id}` : "/api/top-vendor-products";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        loadProducts();
        setSuccess(editing ? "Food item updated successfully!" : "Food item added successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || errorData.message || "Failed to save food item");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /* ================= PRODUCT ACTIONS ================= */

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;

    try {
      await fetch(`/api/top-vendor-products/${id}`, { method: "DELETE" });
      loadProducts();
      setSuccess("Food item deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting food item");
    }
  };

  const toggleAvailability = async (product: FoodItem) => {
    try {
      await fetch(`/api/top-vendor-products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isAvailable: !product.isAvailable,
          topVendorId: topVendorAuth?.topVendorId 
        }),
      });
      loadProducts();
    } catch (err) {
      console.error("Toggle error:", err);
      setError("Error updating availability");
    }
  };

  const toggleFeatured = async (product: FoodItem) => {
    try {
      await fetch(`/api/top-vendor-products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isFeatured: !product.isFeatured,
          topVendorId: topVendorAuth?.topVendorId 
        }),
      });
      loadProducts();
    } catch (err) {
      console.error("Toggle featured error:", err);
      setError("Error updating featured status");
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("topVendorAuth");
    router.replace("/topVendor/login");
  };

  /* ================= RENDER ================= */

  if (!topVendorAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600">Manage your food menu items</p>
            {topVendorAuth.businessName && (
              <p className="text-sm text-gray-500 mt-1">Welcome, {topVendorAuth.businessName}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editing ? "✏️ Edit Food Item" : "➕ Add New Food Item"}
          </h2>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name *
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter food name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                min="0"
                step="100"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={uploading}
              >
                <option value="">Select category</option>
                <option value="main-course">Main Course</option>
                <option value="appetizer">Appetizer</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="side-dish">Side Dish</option>
                <option value="salad">Salad</option>
                <option value="soup">Soup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Food description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 15"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value ? Number(e.target.value) : "")}
                  min="0"
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients (comma separated)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., chicken, rice, vegetables, spices"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={uploading}
              />
              
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}

              {editing?.imageUrl && !imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={editing.imageUrl}
                      alt="Current food item"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={uploading}
                />
                <span className="text-sm text-gray-700">Available for order</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-yellow-600 rounded focus:ring-yellow-500"
                  disabled={uploading}
                />
                <span className="text-sm text-gray-700">Featured Item</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveProduct}
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
                ) : editing ? "Update Food Item" : "Add Food Item"}
              </button>

              {editing && (
                <button
                  onClick={resetForm}
                  disabled={uploading}
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCTS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Menu Items</h2>
              <p className="text-sm text-gray-600 mt-1">
                {products.filter(p => p.isAvailable).length} available • {products.length} total • {products.filter(p => p.isFeatured).length} featured
              </p>
            </div>
            <button
              onClick={loadProducts}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh menu items"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading menu items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No menu items yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first food item to start selling</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <p className="text-blue-600 font-bold mt-1">₦{product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${product.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </span>
                          {product.isFeatured && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {product.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {product.preparationTime} min
                        </span>
                        {product.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {ingredient}
                          </span>
                        ))}
                        {product.ingredients.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            +{product.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleAvailability(product)}
                        className={`p-2 rounded-lg transition-colors ${product.isAvailable ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                        title={product.isAvailable ? "Mark unavailable" : "Mark available"}
                      >
                        {product.isAvailable ? (
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
                      <button
                        onClick={() => toggleFeatured(product)}
                        className={`p-2 rounded-lg transition-colors ${product.isFeatured ? "text-gray-600 hover:bg-gray-50" : "text-yellow-600 hover:bg-yellow-50"}`}
                        title={product.isFeatured ? "Remove featured" : "Mark as featured"}
                      >
                        {product.isFeatured ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
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
    </div>
  );
}