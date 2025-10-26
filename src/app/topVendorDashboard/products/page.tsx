"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: File | string | null;
  ingredients: string[];
  preparationTime: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FoodItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample initial data
  useEffect(() => {
    const initialProducts: FoodItem[] = [
      { 
        id: "1", 
        name: "Jollof Rice with Chicken", 
        description: "Classic Nigerian jollof rice served with well-seasoned chicken", 
        price: 2500, 
        category: "Main Dish", 
        image: null, 
        ingredients: ["Rice", "Tomatoes", "Chicken", "Spices"], 
        preparationTime: 20,
        isAvailable: true,
        isFeatured: true
      },
      { 
        id: "2", 
        name: "Pounded Yam & Egusi Soup", 
        description: "Smooth pounded yam with delicious egusi soup and assorted meat", 
        price: 3500, 
        category: "Main Dish", 
        image: null, 
        ingredients: ["Yam", "Egusi", "Assorted Meat", "Vegetables"], 
        preparationTime: 30,
        isAvailable: true,
        isFeatured: false
      },
    ];
    
    setProducts(initialProducts);
    setCategories(["Main Dish", "Appetizer", "Side Dish", "Beverage", "Dessert"]);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to your server here
      // For this example, we'll just create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // For form submission, we'll keep the file reference
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, image: file });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const productData: FoodItem = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      image: editingProduct?.image || null,
      ingredients: (formData.get("ingredients") as string).split(",").map(i => i.trim()),
      preparationTime: Number(formData.get("preparationTime")),
      isAvailable: formData.get("isAvailable") === "on",
      isFeatured: formData.get("isFeatured") === "on",
    };

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      // Add new product
      setProducts([...products, productData]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
    ));
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const openModal = (product: FoodItem | null = null) => {
    setEditingProduct(product);
    if (product?.image && typeof product.image === 'string') {
      setImagePreview(product.image);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark">Food Menu Management</h1>
          <p className="text-gray-500">Add and manage items that will appear on your public page</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Item
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cream rounded-xl p-4 border border-olive">
          <p className="text-sm text-olive">Total Menu Items</p>
          <p className="text-2xl font-bold text-dark">{products.length}</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-mustard">
          <p className="text-sm text-mustard">Available Items</p>
          <p className="text-2xl font-bold text-dark">{products.filter(p => p.isAvailable).length}</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-green">
          <p className="text-sm text-green">Featured Items</p>
          <p className="text-2xl font-bold text-dark">{products.filter(p => p.isFeatured).length}</p>
        </div>
        <div className="bg-cream rounded-xl p-4 border border-dark">
          <p className="text-sm text-dark">Categories</p>
          <p className="text-2xl font-bold text-dark">{categories.length}</p>
        </div>
      </div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark">Your Menu Items</h2>
          <div className="flex space-x-4">
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive">
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search menu items..."
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-dark">No menu items yet</h3>
            <p className="mt-2 text-gray-500">Get started by adding your first food item</p>
            <button 
              onClick={() => openModal()}
              className="mt-4 bg-olive text-cream px-4 py-2 rounded-lg font-medium hover:bg-olive-2 transition"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={typeof product.image === 'string' ? product.image : URL.createObjectURL(product.image)} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isAvailable ? "bg-green text-cream" : "bg-dark text-cream"
                    }`}>
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    {product.isFeatured && (
                      <span className="px-2 py-1 rounded-full text-xs bg-olive text-cream">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-dark">{product.name}</h3>
                    <span className="font-bold text-olive">₦{product.price.toLocaleString()}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{product.category}</span>
                    <span>{product.preparationTime} mins</span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-dark mb-1">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.ingredients.slice(0, 3).map((ingredient, i) => (
                        <span key={i} className="px-2 py-1 bg-cream text-dark text-xs rounded">
                          {ingredient}
                        </span>
                      ))}
                      {product.ingredients.length > 3 && (
                        <span className="px-2 py-1 bg-cream text-dark text-xs rounded">
                          +{product.ingredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal(product)}
                        className="text-olive hover:text-olive-2 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="text-dark hover:text-gray-600 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.isAvailable}
                        onChange={() => toggleAvailability(product.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-dark mb-4">
              {editingProduct ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ""}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description *</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  rows={3}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingProduct?.price || ""}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Category *</label>
                <div className="flex space-x-2 mb-2">
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || ""}
                    required
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  />
                  <button 
                    type="button"
                    onClick={addCategory}
                    className="px-3 py-2 bg-cream text-olive border border-olive rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Food Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto h-32 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, image: null });
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-olive hover:text-olive-2 focus-within:outline-none">
                            <span>Upload an image</span>
                            <input 
                              id="image-upload" 
                              name="image-upload" 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={handleImageChange}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Ingredients (comma separated) *</label>
                <input
                  type="text"
                  name="ingredients"
                  defaultValue={editingProduct?.ingredients.join(", ") || ""}
                  required
                  placeholder="Rice, Chicken, Tomatoes, Spices"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Preparation Time (minutes) *</label>
                <input
                  type="number"
                  name="preparationTime"
                  defaultValue={editingProduct?.preparationTime || ""}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
              </div>
              
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={editingProduct ? editingProduct.isAvailable : true}
                    className="rounded border-gray-300 text-olive focus:ring-olive"
                  />
                  <span className="ml-2 text-sm text-dark">Available for order</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    defaultChecked={editingProduct ? editingProduct.isFeatured : false}
                    className="rounded border-gray-300 text-olive focus:ring-olive"
                  />
                  <span className="ml-2 text-sm text-dark">Feature on homepage</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-dark hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-olive text-cream rounded-lg font-medium hover:bg-olive-2"
                >
                  {editingProduct ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}