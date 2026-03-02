"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch"; // 👈 import the toggle

type FoodItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  ingredients: string[];
  isAvailable: boolean;
  createdAt: string;
};

const CATEGORIES = ["Food", "Native Food", "Futo Street Food", "Dessert", "Ice Cream", "Pizza", "Coffee"];

export default function TopVendorProductsPage() {
  const router = useRouter();
  const [topVendorAuth, setTopVendorAuth] = useState<{ topVendorId: string; businessName?: string } | null>(null);
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [editing, setEditing] = useState<FoodItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("topVendorAuth");
    if (!auth) { router.replace("/topVendor/login"); return; }
    try {
      const parsed = JSON.parse(auth);
      const resolvedId = parsed.topVendorId || parsed._id || parsed.id;
      if (!resolvedId) throw new Error("Invalid auth");
      setTopVendorAuth({ topVendorId: resolvedId, businessName: parsed.businessName });
    } catch {
      router.replace("/topVendor/login");
    }
  }, [router]);

  const loadProducts = useCallback(async () => {
    if (!topVendorAuth?.topVendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/top-vendor-products?topVendorId=${topVendorAuth.topVendorId}`);
      if (res.ok) setProducts(await res.json());
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [topVendorAuth]);

  useEffect(() => {
    if (topVendorAuth) loadProducts();
  }, [topVendorAuth, loadProducts]);

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setCategory(""); setIngredients(""); setIsAvailable(true);
    setImageFile(null); setImagePreview(null); setEditing(null); setError(null); setSuccess(null);
    if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    setImageFile(file ?? null);
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError("Image too large"); return; }
      const preview = URL.createObjectURL(file);
      previewRef.current = preview;
      setImagePreview(preview);
    } else setImagePreview(null);
  };

  async function uploadBase64Image(dataUrl: string): Promise<string> {
    const res = await fetch("/api/upload-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url;
  }

  const saveProduct = async () => {
    if (!name.trim()) { setError("Name required"); return; }
    if (!price || Number(price) <= 0) { setError("Valid price required"); return; }
    if (!category) { setError("Select category"); return; }
    if (!topVendorAuth) return;

    setUploading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile!);
        });
        imageUrl = await uploadBase64Image(base64);
      } else if (editing?.imageUrl) {
        imageUrl = editing.imageUrl;
      }

      const payload = {
        topVendorId: topVendorAuth.topVendorId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        ingredients: ingredients.split(",").map(i => i.trim()).filter(i => i),
        isAvailable,
        imageUrl,
      };

      const url = editing ? `/api/top-vendor-products/${editing._id}` : "/api/top-vendor-products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      if (res.ok) {
        resetForm(); loadProducts(); setSuccess(editing ? "Updated!" : "Added!");
      } else {
        const err = await res.json();
        setError(err.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
    } finally {
      setUploading(false);
    }
  };

  const editProduct = (p: FoodItem) => {
    resetForm();
    setEditing(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setIngredients(p.ingredients.join(", "));
    setIsAvailable(p.isAvailable);
    setImagePreview(p.imageUrl || null);
    window.scrollTo({ top: 0 });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      await fetch(`/api/top-vendor-products/${id}`, { method: "DELETE" });
      loadProducts();
    } catch (err) { console.error(err); }
  };

  const toggleAvailability = async (p: FoodItem) => {
    try {
      await fetch(`/api/top-vendor-products/${p._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !p.isAvailable, topVendorId: topVendorAuth?.topVendorId }),
      });
      loadProducts();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("topVendorAuth");
    router.replace("/topVendor/login");
  };

  if (!topVendorAuth) {
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
            <h1 className="text-2xl font-bold text-gray-900">Top Vendor Dashboard</h1>
            <p className="text-gray-600">Manage your food items</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Logout</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">⚠️ {error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">✓ {success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editing ? "Edit Item" : "Add New Item"}</h2>
            <div className="space-y-4">
              <input className="w-full px-4 py-3 border rounded-lg" placeholder="Food name *" value={name} onChange={(e) => setName(e.target.value)} disabled={uploading} />
              <input type="number" className="w-full px-4 py-3 border rounded-lg" placeholder="Price (₦) *" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} disabled={uploading} />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg" disabled={uploading}>
                <option value="">Select category *</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea rows={3} className="w-full px-4 py-3 border rounded-lg" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} />
              <input className="w-full px-4 py-3 border rounded-lg" placeholder="Ingredients (comma separated)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} disabled={uploading} />
              <div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 border rounded-lg" disabled={uploading} />
                {imagePreview && <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border"><img src={imagePreview} alt="Preview" className="object-cover w-full h-full" /></div>}
                {editing?.imageUrl && !imagePreview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border"><Image src={editing.imageUrl} alt="Current" fill className="object-cover" /></div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                  disabled={uploading}
                />
                <label htmlFor="available" className="text-sm text-gray-700">Available for order</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={saveProduct} disabled={uploading || !name || !price || !category} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? "Saving..." : editing ? "Update" : "Add Item"}
                </button>
                {editing && <button onClick={resetForm} disabled={uploading} className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>}
              </div>
            </div>
          </div>

          {/* LIST */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Items</h2>
              <span className="text-sm text-gray-600">{products.filter(p => p.isAvailable).length} available • {products.length} total</span>
            </div>
            {loading ? <div className="text-center py-12">Loading...</div> : products.length === 0 ? <div className="text-center py-12 text-gray-500">No items yet</div> : (
              <div className="space-y-4">
                {products.map(p => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>}
                      </div>
                      <div className="flex-1">
                        <div>
                          <h3 className="font-medium text-gray-900">{p.name}</h3>
                          <p className="text-blue-600 font-bold">₦{p.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                        </div>
                        {p.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <button onClick={() => editProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                        <ToggleSwitch
                          isOn={p.isAvailable}
                          onToggle={() => toggleAvailability(p)}
                        />
                        <button onClick={() => deleteProduct(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
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