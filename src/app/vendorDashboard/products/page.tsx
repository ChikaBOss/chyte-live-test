"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/image-compression";

/* ================= TYPES ================= */

type VendorProduct = {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  available: boolean;
  createdAt: string;
  // Vendor-specific fields
  category?: string;
  stock?: number;
  tags?: string[];
  sku?: string;
  weight?: string;
  dimensions?: string;
  discount?: number;
};

/* ================= PAGE ================= */

export default function VendorProductsPage() {
  const router = useRouter();
  
  // 🔐 Vendor auth with better handling
  const [vendorAuth, setVendorAuth] = useState<{ 
    vendorId: string; 
    name?: string;
    email?: string;
  } | null>(null);

  /* ================= STATE ================= */

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [editing, setEditing] = useState<VendorProduct | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [tags, setTags] = useState("");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [discount, setDiscount] = useState<number | "">("");

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
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("vendorAuth");
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          setVendorAuth(parsed);
        } catch (e) {
          console.error("Failed to parse vendor auth:", e);
          router.replace("/vendor/login");
        }
      } else {
        router.replace("/vendor/login");
      }
    }
  }, [router]);

  /* ================= LOAD PRODUCTS ================= */

  const loadProducts = useCallback(async () => {
    if (!vendorAuth?.vendorId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/vendor-products?vendorId=${vendorAuth.vendorId}`,
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
        setError(errorData.error || "Failed to load products");
      }
    } catch (err: any) {
      console.error("Load error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [vendorAuth]);

  useEffect(() => {
    if (vendorAuth?.vendorId) {
      loadProducts();
    }
  }, [vendorAuth, loadProducts]);

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
    setPrice("");
    setDescription("");
    setAvailable(true);
    setCategory("");
    setStock("");
    setTags("");
    setSku("");
    setWeight("");
    setDimensions("");
    setDiscount("");
    
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

  const editProduct = (product: VendorProduct) => {
    setEditing(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setAvailable(product.available);
    setImagePreview(product.imageUrl || null);
    
    if (product.category) setCategory(product.category);
    if (product.stock !== undefined) setStock(product.stock);
    if (product.tags) setTags(product.tags.join(", "));
    if (product.sku) setSku(product.sku);
    if (product.weight) setWeight(product.weight);
    if (product.dimensions) setDimensions(product.dimensions);
    if (product.discount) setDiscount(product.discount);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= SAVE PRODUCT ================= */

  const saveProduct = async () => {
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Valid price is required");
      return;
    }

    if (!vendorAuth?.vendorId) {
      setError("Vendor authentication required");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      let imageUrl = "";
      if (imageFile) {
        let compressed: string | undefined;
        
        try {
          compressed = await compressImage(imageFile);
        } catch (compressionError) {
          console.error("Image compression failed:", compressionError);
          setError("Failed to process image. Please try another.");
          setUploading(false);
          return;
        }

        if (compressed && compressed.startsWith("data:")) {
          try {
            imageUrl = await uploadBase64Image(compressed);
          } catch (uploadErr) {
            console.error("Image upload failed:", uploadErr);
            setError("Failed to upload image. Please try again.");
            setUploading(false);
            return;
          }
        } else if (compressed && (compressed.startsWith("http://") || compressed.startsWith("https://"))) {
          imageUrl = compressed;
        } else {
          // Fallback to basic base64 upload
          const base64 = await fileToBase64(imageFile);
          imageUrl = await uploadBase64Image(base64);
        }
      } else if (editing?.imageUrl) {
        imageUrl = editing.imageUrl;
      }

      const payload = {
        vendorId: vendorAuth.vendorId,
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        available,
        imageUrl,
        // Optional fields
        ...(category && { category: category.trim() }),
        ...(stock !== "" && { stock: Number(stock) }),
        ...(tags && { tags: tags.split(",").map(t => t.trim()).filter(t => t) }),
        ...(sku && { sku: sku.trim() }),
        ...(weight && { weight: weight.trim() }),
        ...(dimensions && { dimensions: dimensions.trim() }),
        ...(discount !== "" && { discount: Number(discount) }),
      };

      const url = editing ? `/api/vendor-products/${editing._id}` : "/api/vendor-products";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        loadProducts();
        setSuccess(editing ? "Product updated successfully!" : "Product added successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || errorData.message || "Failed to save product");
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
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch(`/api/vendor-products/${id}`, { method: "DELETE" });
      loadProducts();
      setSuccess("Product deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting product");
    }
  };

  const toggleAvailability = async (product: VendorProduct) => {
    try {
      await fetch(`/api/vendor-products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          available: !product.available,
          vendorId: vendorAuth?.vendorId 
        }),
      });
      loadProducts();
    } catch (err) {
      console.error("Toggle error:", err);
      setError("Error updating availability");
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("vendorAuth");
    router.replace("/vendor/login");
  };

  /* ================= RENDER ================= */

  if (!vendorAuth) {
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
            <p className="text-gray-600">Manage your products</p>
            {vendorAuth.name && (
              <p className="text-sm text-gray-500 mt-1">Welcome, {vendorAuth.name}</p>
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
            {editing ? "✏️ Edit Product" : "➕ Add New Product"}
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
                Product Name *
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
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
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>

            {/* Vendor-specific fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={uploading}
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="beauty">Beauty</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product SKU"
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Available quantity"
                  min="0"
                  disabled={uploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Discount percentage"
                  min="0"
                  max="100"
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1kg, 500g"
                  disabled={uploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10x20x5cm"
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., new-arrival, best-seller, eco-friendly"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
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
                      alt="Current product"
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
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={uploading}
                />
                <span className="text-sm text-gray-700">Available for sale</span>
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
                ) : editing ? "Update Product" : "Add Product"}
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
              <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
              <p className="text-sm text-gray-600 mt-1">
                {products.filter(p => p.available).length} available • {products.length} total
              </p>
            </div>
            <button
              onClick={loadProducts}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh products"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No products yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first product</p>
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-blue-600 font-bold">₦{product.price.toLocaleString()}</p>
                            {product.discount && product.discount > 0 && (
                              <span className="text-sm text-red-600 line-through">
                                ₦{Math.round(product.price * (1 + product.discount/100)).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${product.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {product.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {product.category && (
                          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {product.category}
                          </span>
                        )}
                        {product.sku && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            SKU: {product.sku}
                          </span>
                        )}
                        {product.stock !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded ${product.stock > 10 ? "bg-green-100 text-green-800" : product.stock > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                            Stock: {product.stock}
                          </span>
                        )}
                        {product.discount && product.discount > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                        {product.tags?.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
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
                        className={`p-2 rounded-lg transition-colors ${product.available ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                        title={product.available ? "Mark unavailable" : "Mark available"}
                      >
                        {product.available ? (
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