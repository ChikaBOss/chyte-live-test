"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/image-compression";
import ToggleSwitch from "@/components/ToggleSwitch"; // 👈 import the toggle

type Meal = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description: string;
  available: boolean;
  ingredients: string[];
  category: string;
  createdAt: string;
};

const CATEGORIES = [
  "Food", "Native Food", "Futo Street Food", "Dessert", "Ice Cream", "Pizza", "Coffee"
];

export default function ChefMealsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [available, setAvailable] = useState(true);
  const [category, setCategory] = useState("");
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const previewRef = useRef<string | null>(null);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  // Load meals
  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/meals");
      if (res.ok) {
        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } else {
        setError("Failed to load meals");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") loadMeals();
  }, [status, loadMeals]);

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setDescription("");
    setIngredients("");
    setAvailable(true);
    setCategory("");
    setImageFile(null);
    setImagePreview(null);
    setEditingMeal(null);
    setError(null);
    setSuccess(null);
    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
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

  const saveMeal = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!price || Number(price) <= 0) { setError("Valid price required"); return; }
    if (!category) { setError("Please select a category"); return; }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

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
      } else if (editingMeal?.imageUrl) {
        imageUrl = editingMeal.imageUrl;
      }

      const mealData = {
        name: name.trim(),
        price: Number(price),
        imageUrl,
        description: description.trim(),
        ingredients: ingredients.split(",").map(i => i.trim()).filter(i => i),
        available,
        category,
      };

      const url = editingMeal ? `/api/meals/${editingMeal._id}` : "/api/meals";
      const method = editingMeal ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(mealData) });

      if (res.ok) {
        const saved = await res.json();
        if (editingMeal) {
          setMeals(prev => prev.map(m => m._id === editingMeal._id ? saved : m));
        } else {
          setMeals(prev => [saved, ...prev]);
        }
        resetForm();
        setSuccess(editingMeal ? "Meal updated!" : "Meal added!");
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

  const editMeal = (meal: Meal) => {
    resetForm();
    setEditingMeal(meal);
    setName(meal.name);
    setPrice(meal.price);
    setDescription(meal.description);
    setIngredients(meal.ingredients.join(", "));
    setAvailable(meal.available);
    setCategory(meal.category || "");
    setImagePreview(meal.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMeal = async (id: string) => {
    if (!confirm("Delete this meal?")) return;
    try {
      const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMeals(prev => prev.filter(m => m._id !== id));
        setSuccess("Meal deleted");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (meal: Meal) => {
    try {
      const res = await fetch(`/api/meals/${meal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !meal.available }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMeals(prev => prev.map(m => m._id === meal._id ? updated : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chef Dashboard</h1>
        <p className="text-gray-600 mb-6">Manage your meals</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingMeal ? "Edit Meal" : "Add New Meal"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Jollof Rice"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description..."
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma separated)</label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="rice, chicken, tomatoes"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border rounded-lg"
                  disabled={uploading}
                />
                {imagePreview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border">
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
                {editingMeal?.imageUrl && !imagePreview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border">
                    <Image src={editingMeal.imageUrl} alt="Current" fill className="object-cover" />
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
                <label htmlFor="available" className="text-sm text-gray-700">Available for order</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveMeal}
                  disabled={uploading || !name || !price || !category}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Saving..." : editingMeal ? "Update Meal" : "Add Meal"}
                </button>
                {editingMeal && (
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

          {/* MEALS LIST */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Meals</h2>
              <span className="text-sm text-gray-600">
                {meals.filter(m => m.available).length} available • {meals.length} total
              </span>
            </div>

            {meals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No meals yet</div>
            ) : (
              <div className="space-y-4">
                {meals.map(meal => (
                  <motion.div key={meal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {meal.imageUrl ? (
                          <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{meal.name}</h3>
                            <p className="text-blue-600 font-bold">₦{meal.price.toLocaleString()}</p>
                            {meal.category && <p className="text-xs text-gray-500">{meal.category}</p>}
                          </div>
                          {/* Removed the old badge – the toggle now shows availability */}
                        </div>
                        {meal.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{meal.description}</p>}
                        {meal.ingredients.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                            <span>🧂 {meal.ingredients.slice(0, 2).join(", ")}</span>
                            {meal.ingredients.length > 2 && <span>+{meal.ingredients.length - 2} more</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <button onClick={() => editMeal(meal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                        <ToggleSwitch
                          isOn={meal.available}
                          onToggle={() => toggleAvailability(meal)}
                        />
                        <button onClick={() => deleteMeal(meal._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
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