"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/image-compression";
import ToggleSwitch from "@/components/ToggleSwitch";

type VendorProduct = {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  available: boolean;
  category?: string;
  stock?: number;
  createdAt: string;
};

const CATEGORIES = [
  "Grocery",
  "Food",
  "Sanitary",
  "Dessert",
  "Ice Cream",
  "Pizza",
  "Coffee",
  "Other"
];

export default function VendorProductsPage() {
  const router = useRouter();
  const [vendorAuth, setVendorAuth] = useState<{ vendorId: string; name?: string } | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [editing, setEditing] = useState<VendorProduct | null>(null);

  // Form state – only what we need
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<number | "">("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("vendorAuth");
      if (auth) {
        try {
          setVendorAuth(JSON.parse(auth));
        } catch {
          router.replace("/vendor/login");
        }
      } else {
        router.replace("/vendor/login");
      }
    }
  }, [router]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!vendorAuth?.vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vendor-products?vendorId=${vendorAuth.vendorId}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to load products");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [vendorAuth]);

  useEffect(() => {
    if (vendorAuth?.vendorId) loadProducts();
  }, [vendorAuth, loadProducts]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setAvailable(true);
    setCategory("");
    setStock("");
    setImageFile(null);
    setImagePreview(null);
    setEditing(null);
    setError(null);
    setSuccess(null);
    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setImageFile(file ?? null);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image too large (max 5MB)");
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
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
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

  const saveProduct = async () => {
    if (!name.trim()) { setError("Product name is required"); return; }
    if (!price || Number(price) <= 0) { setError("Valid price is required"); return; }
    if (!category) { setError("Please select a category"); return; }
    if (!vendorAuth?.vendorId) { setError("Authentication error"); return; }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      let imageUrl = "";
      if (imageFile) {
        const compressed = await compressImage(imageFile).catch(() => null);
        if (compressed?.startsWith("data:")) {
          imageUrl = await uploadBase64Image(compressed);
        } else if (compressed?.startsWith("http")) {
          imageUrl = compressed;
        } else {
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
        category: category.trim(),
        stock: stock === "" ? undefined : Number(stock),
        imageUrl,
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
        setSuccess(editing ? "Product updated!" : "Product added!");
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
    } finally {
      setUploading(false);
    }
  };

  const editProduct = (p: VendorProduct) => {
    resetForm();
    setEditing(p);
    setName(p.name);
    setPrice(p.price);
    setDescription(p.description);
    setAvailable(p.available);
    setCategory(p.category || "");
    setStock(p.stock ?? "");
    setImagePreview(p.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/vendor-products/${id}`, { method: "DELETE" });
      loadProducts();
      setSuccess("Product deleted");
    } catch {
      setError("Error deleting product");
    }
  };

  const toggleAvailability = async (p: VendorProduct) => {
    try {
      await fetch(`/api/vendor-products/${p._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !p.available, vendorId: vendorAuth?.vendorId }),
      });
      loadProducts();
    } catch {
      setError("Error updating availability");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorAuth");
    router.replace("/vendor/login");
  };

  if (!vendorAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600">Manage your products</p>
            {vendorAuth.name && (
              <p className="text-sm text-gray-500 mt-1">Welcome, {vendorAuth.name}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✓ {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editing ? "Edit Product" : "Add New Product"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Organic Rice"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2500"
                  min="0"
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
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description..."
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock (optional)
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Available quantity"
                  min="0"
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
                  className="w-full px-4 py-3 border rounded-lg"
                  disabled={uploading}
                />
                {imagePreview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                {editing?.imageUrl && !imagePreview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border">
                    <Image
                      src={editing.imageUrl}
                      alt="Current"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                  disabled={uploading}
                />
                <label htmlFor="available" className="text-sm text-gray-700">
                  Available for sale
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProduct}
                  disabled={uploading || !name || !price || !category}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Saving..." : editing ? "Update Product" : "Add Product"}
                </button>
                {editing && (
                  <button
                    onClick={resetForm}
                    disabled={uploading}
                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
              <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
              <span className="text-sm text-gray-600">
                {products.filter((p) => p.available).length} available • {products.length} total
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No products yet</div>
            ) : (
              <div className="space-y-4">
                {products.map((p) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            📷
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{p.name}</h3>
                        <p className="text-blue-600 font-bold">₦{p.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.category}
                          {p.stock !== undefined && ` • Stock: ${p.stock}`}
                        </p>
                        {p.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <button
                          onClick={() => editProduct(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <ToggleSwitch isOn={p.available} onToggle={() => toggleAvailability(p)} />
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          🗑️
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
    </div>
  );
}