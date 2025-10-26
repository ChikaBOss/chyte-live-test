"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Meal = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  available: boolean;
  category: string;
  preparationTime: number; // in minutes
  ingredients: string[];
};

type Order = {
  id: number;
  customerName: string;
  items: Meal[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  orderTime: string;
};

export default function ChefDashboardPage() {
  const [activeTab, setActiveTab] = useState<"meals" | "orders" | "analytics">("meals");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Meal form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("main");
  const [preparationTime, setPreparationTime] = useState<number | "">("");
  const [ingredients, setIngredients] = useState("");
  const [available, setAvailable] = useState(true);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const savedMeals = localStorage.getItem("chefMeals");
    const savedOrders = localStorage.getItem("chefOrders");
    
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    } else {
      // Sample initial meals
      const sampleMeals: Meal[] = [
        {
          id: 1,
          name: "Jollof Rice with Chicken",
          price: 1800,
          imageUrl: "/images/jollof.jpg",
          description: "Flavorful jollof rice with well-seasoned chicken",
          available: true,
          category: "main",
          preparationTime: 25,
          ingredients: ["Rice", "tomato", "pepper", "chicken", "spices"] // Changed to array
        },
        {
          id: 2,
          name: "Pepper Soup",
          price: 1500,
          imageUrl: "/images/peppersoup.jpg",
          description: "Spicy and aromatic pepper soup",
          available: true,
          category: "soup",
          preparationTime: 30,
          ingredients: ["Fish", "pepper", "utazi", "spices"] // Changed to array
        }
      ];
      setMeals(sampleMeals);
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Sample orders
      const sampleOrders: Order[] = [
        {
          id: 1001,
          customerName: "Chidi Obi",
          items: [{
            id: 1,
            name: "Jollof Rice with Chicken",
            price: 1800,
            imageUrl: "/images/jollof.jpg",
            description: "Flavorful jollof rice with well-seasoned chicken",
            available: true,
            category: "main",
            preparationTime: 25,
            ingredients: ["Rice", "tomato", "pepper", "chicken", "spices"] // Changed to array
          }],
          total: 1800,
          status: "preparing",
          orderTime: new Date().toISOString()
        }
      ];
      setOrders(sampleOrders);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chefMeals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("chefOrders", JSON.stringify(orders));
  }, [orders]);

  function resetForm() {
    setName("");
    setPrice("");
    setImageUrl("");
    setDescription("");
    setCategory("main");
    setPreparationTime("");
    setIngredients("");
    setAvailable(true);
    setEditingMeal(null);
  }

  function addOrUpdateMeal() {
    if (!name || !price) {
      alert("Please enter name and price");
      return;
    }

    if (editingMeal) {
      // Update existing meal
      setMeals(meals.map(meal => 
        meal.id === editingMeal.id 
          ? {
              ...editingMeal,
              name,
              price: Number(price),
              imageUrl,
              description,
              category,
              preparationTime: Number(preparationTime),
              ingredients: ingredients.split(',').map(i => i.trim()),
              available
            }
          : meal
      ));
    } else {
      // Add new meal
      const newMeal: Meal = {
        id: Date.now(),
        name,
        price: Number(price),
        imageUrl,
        description,
        category,
        preparationTime: Number(preparationTime),
        ingredients: ingredients.split(',').map(i => i.trim()),
        available,
      };
      setMeals([newMeal, ...meals]);
    }
    resetForm();
  }

  function editMeal(meal: Meal) {
    setEditingMeal(meal);
    setName(meal.name);
    setPrice(meal.price);
    setImageUrl(meal.imageUrl);
    setDescription(meal.description);
    setCategory(meal.category);
    setPreparationTime(meal.preparationTime);
    setIngredients(meal.ingredients.join(', '));
    setAvailable(meal.available);
  }

  function removeMeal(id: number) {
    if (confirm("Are you sure you want to delete this meal?")) {
      setMeals(meals.filter((m) => m.id !== id));
    }
  }

  function toggleAvailability(id: number) {
    setMeals(meals.map((m) => (m.id === id ? { ...m, available: !m.available } : m)));
  }

  function updateOrderStatus(orderId: number, status: Order["status"]) {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  }

  // Analytics calculations
  const totalRevenue = orders
    .filter(order => order.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const activeOrders = orders.filter(order => 
    order.status === "preparing" || order.status === "ready"
  ).length;

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Chef Dashboard</h1>
          <p className="text-dark/70">Manage your meals and orders</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-olive-2">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green/20 rounded-full flex items-center justify-center">
                <span className="text-green text-xl">₦</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-500">{pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 text-xl">⏱</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark/70 text-sm">Active Orders</p>
                <p className="text-2xl font-bold text-blue-500">{activeOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 text-xl">🔥</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-dark/20 mb-6">
          {[
            { id: "meals" as const, label: "Meals", icon: "🍽️" },
            { id: "orders" as const, label: "Orders", icon: "📦" },
            { id: "analytics" as const, label: "Analytics", icon: "📊" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-green text-green"
                  : "border-transparent text-dark/70 hover:text-dark"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Meals Tab */}
        {activeTab === "meals" && (
          <div className="space-y-6">
            {/* Add/Edit Meal Form */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-bold text-dark mb-4">
                {editingMeal ? "Edit Meal" : "Add New Meal"}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-dark font-medium mb-2">Meal Name *</label>
                    <input
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="e.g., Jollof Rice with Chicken"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Price (₦) *</label>
                    <input
                      type="number"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="1800"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Category</label>
                    <select
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="main">Main Course</option>
                      <option value="soup">Soup</option>
                      <option value="appetizer">Appetizer</option>
                      <option value="dessert">Dessert</option>
                      <option value="drink">Drink</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="25"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-dark font-medium mb-2">Image URL</label>
                    <input
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Description</label>
                    <textarea
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green resize-none"
                      placeholder="Describe your meal..."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-dark font-medium mb-2">Ingredients (comma separated)</label>
                    <textarea
                      className="w-full border border-dark/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green resize-none"
                      placeholder="Rice, chicken, tomatoes, pepper..."
                      rows={2}
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="w-4 h-4 text-green focus:ring-green"
                    />
                    <span className="text-dark">Available for order</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addOrUpdateMeal}
                  className="bg-green text-cream px-6 py-3 rounded-xl font-semibold hover:bg-dark transition-colors"
                >
                  {editingMeal ? "Update Meal" : "Add Meal"}
                </button>
                
                {editingMeal && (
                  <button
                    onClick={resetForm}
                    className="bg-dark/10 text-dark px-6 py-3 rounded-xl font-semibold hover:bg-dark/20 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>

            {/* Meals List */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6 border-b border-dark/10">
                <h3 className="text-xl font-bold text-dark">Your Meals ({meals.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream border-b border-dark/10">
                      <th className="text-left p-4 font-semibold text-dark">Meal</th>
                      <th className="text-left p-4 font-semibold text-dark">Price</th>
                      <th className="text-left p-4 font-semibold text-dark">Category</th>
                      <th className="text-left p-4 font-semibold text-dark">Prep Time</th>
                      <th className="text-left p-4 font-semibold text-dark">Status</th>
                      <th className="text-left p-4 font-semibold text-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {meals.map((meal, index) => (
                        <motion.tr 
                          key={meal.id}
                          className="border-b border-dark/10 hover:bg-cream/50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {meal.imageUrl ? (
                                <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                                  <Image
                                    src={meal.imageUrl}
                                    alt={meal.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-green/20 rounded-lg flex items-center justify-center">
                                  <span className="text-green text-lg">🍽️</span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-dark">{meal.name}</div>
                                <div className="text-sm text-dark/60 line-clamp-1">{meal.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-dark font-semibold">₦{meal.price.toLocaleString()}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-olive-2/20 text-dark text-xs rounded-full capitalize">
                              {meal.category}
                            </span>
                          </td>
                          <td className="p-4 text-dark/70">{meal.preparationTime} min</td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleAvailability(meal.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                meal.available
                                  ? "bg-green/20 text-green"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {meal.available ? "Available" : "Unavailable"}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editMeal(meal)}
                                className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                                title="Edit meal"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => removeMeal(meal.id)}
                                className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Delete meal"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {meals.length === 0 && (
                  <div className="text-center py-12 text-dark/60">
                    <div className="text-4xl mb-3">🍽️</div>
                    <p>No meals added yet</p>
                    <p className="text-sm">Add your first meal using the form above</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-dark">Order #{order.id}</h3>
                    <p className="text-dark/60">Customer: {order.customerName}</p>
                    <p className="text-dark/60 text-sm">
                      {new Date(order.orderTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-olive-2">₦{order.total.toLocaleString()}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "preparing" ? "bg-blue-100 text-blue-800" :
                      order.status === "ready" ? "bg-green/20 text-green" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dark/10 pt-4">
                  <h4 className="font-semibold text-dark mb-2">Items:</h4>
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center py-2">
                      <span className="text-dark">{item.name}</span>
                      <span className="text-dark/70">₦{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-dark/10">
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "preparing")}
                      className="bg-green text-cream px-4 py-2 rounded-lg font-medium hover:bg-dark transition-colors"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "ready")}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Mark as Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-12 text-dark/60 bg-white rounded-2xl">
                <div className="text-4xl mb-3">📦</div>
                <p>No orders yet</p>
                <p className="text-sm">Orders will appear here when customers place them</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-dark/10">
                  <span className="text-dark/70">Total Orders</span>
                  <span className="font-bold text-dark">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-dark/10">
                  <span className="text-dark/70">Completed Orders</span>
                  <span className="font-bold text-dark">
                    {orders.filter(o => o.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-dark/10">
                  <span className="text-dark/70">Total Revenue</span>
                  <span className="font-bold text-olive-2">₦{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-dark/10">
                  <span className="text-dark/70">Available Meals</span>
                  <span className="font-bold text-dark">
                    {meals.filter(m => m.available).length} / {meals.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Popular Meals</h3>
              {meals.slice(0, 3).map((meal, index) => (
                <div key={meal.id} className="flex items-center justify-between py-3 border-b border-dark/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green/20 rounded-lg flex items-center justify-center">
                      <span className="text-green">🍽️</span>
                    </div>
                    <span className="text-dark">{meal.name}</span>
                  </div>
                  <span className="font-bold text-olive-2">₦{meal.price.toLocaleString()}</span>
                </div>
              ))}
              {meals.length === 0 && (
                <p className="text-dark/60 text-center py-4">No meals added yet</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}