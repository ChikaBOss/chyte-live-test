"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Order = {
  _id: string;
  id: string;
  items: { 
    mealId: string;
    name: string; 
    price: number; 
    quantity: number;
    image?: string;
  }[];
  total: number;
  // ✅ Added "confirmed" to the union
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled" | "confirmed";
  createdAt: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  customerName?: string;
  specialInstructions?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  serviceType?: string;
  date?: string;
  time?: string;
  guests?: number;
  notes?: string;
};

export default function ChefOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "orders" | "bookings">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch orders from API
  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/orders/chef", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched orders:", data);
          
          const allOrders = Array.isArray(data) ? data : [];
          const mealOrders = allOrders.filter(order => 
            order.serviceType !== "booking" && 
            (!order.items || order.items.length > 0)
          );
          const bookingOrders = allOrders.filter(order => 
            order.serviceType === "booking" || 
            (order.items && order.items.length === 0)
          );

          console.log("Meal orders:", mealOrders.length);
          console.log("Booking orders:", bookingOrders.length);
          
          setOrders(mealOrders);
          setBookings(bookingOrders);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || "Failed to load orders");
          loadMockData();
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Network error. Please check your connection.");
        loadMockData();
      } finally {
        setLoading(false);
      }
    }

    function loadMockData() {
      const mockOrders: Order[] = [
        {
          _id: "1",
          id: "ORD-2847",
          customer: { name: "Sarah Johnson", email: "sarah@email.com", phone: "08012345678" },
          customerName: "Sarah Johnson",
          items: [
            { mealId: "m1", name: "Jollof Rice Deluxe", price: 1800, quantity: 2 },
            { mealId: "m2", name: "Grilled Chicken", price: 1200, quantity: 2 },
          ],
          total: 6000,
          status: "pending",
          createdAt: new Date(Date.now() - 300000).toISOString(),
          specialInstructions: "Please make the jollof rice extra spicy",
          deliveryAddress: "123 Main St, Lagos",
          paymentMethod: "card",
          paymentStatus: "paid",
          serviceType: "order",
        },
        {
          _id: "2",
          id: "ORD-2846",
          customer: { name: "Michael Brown", email: "michael@email.com", phone: "08087654321" },
          customerName: "Michael Brown",
          items: [
            { mealId: "m4", name: "Pounded Yam & Egusi Soup", price: 2500, quantity: 1 },
            { mealId: "m5", name: "Assorted Meat", price: 1500, quantity: 1 },
          ],
          total: 4000,
          status: "preparing",
          createdAt: new Date(Date.now() - 900000).toISOString(),
          deliveryAddress: "456 Oak Ave, Abuja",
          paymentMethod: "transfer",
          paymentStatus: "paid",
          serviceType: "order",
        },
        {
          _id: "3",
          id: "ORD-2845",
          customer: { name: "Jessica Williams", email: "jessica@email.com", phone: "08055551234" },
          customerName: "Jessica Williams",
          items: [
            { mealId: "m6", name: "Fried Rice with Beef", price: 2200, quantity: 3 },
            { mealId: "m7", name: "Small Pepsi", price: 300, quantity: 3 },
          ],
          total: 7500,
          status: "ready",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          deliveryAddress: "789 Pine Rd, Port Harcourt",
          paymentMethod: "cash",
          paymentStatus: "pending",
          serviceType: "order",
        },
        {
          _id: "4",
          id: "BK-2023",
          customer: { name: "David Wilson", email: "david@email.com", phone: "08099998888" },
          customerName: "David Wilson",
          items: [],
          total: 0,
          status: "pending",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          notes: "Birthday party for 20 people, prefer traditional dishes",
          deliveryAddress: "321 Event Hall, Ikeja",
          paymentMethod: "card",
          paymentStatus: "pending",
          serviceType: "booking",
          date: "2024-03-15",
          time: "18:00",
          guests: 20,
        },
        {
          _id: "5",
          id: "BK-2024",
          customer: { name: "Emma Thompson", email: "emma@email.com", phone: "08077776666" },
          customerName: "Emma Thompson",
          items: [],
          total: 0,
          status: "pending",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          notes: "Corporate event, 50 people, buffet style",
          deliveryAddress: "Corporate Plaza, Victoria Island",
          paymentMethod: "transfer",
          paymentStatus: "pending",
          serviceType: "booking",
          date: "2024-03-20",
          time: "19:00",
          guests: 50,
        },
      ];
      setOrders(mockOrders.filter(o => o.serviceType === "order"));
      setBookings(mockOrders.filter(o => o.serviceType === "booking"));
    }

    fetchOrders();
  }, [status]);

  // Filter orders based on type and status
  const getFilteredData = () => {
    let data: Order[] = [];
    
    if (filter === "orders") {
      data = orders;
    } else if (filter === "bookings") {
      data = bookings;
    } else {
      data = [...orders, ...bookings];
    }

    if (statusFilter !== "all") {
      data = data.filter(order => order.status === statusFilter);
    }

    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredData = getFilteredData();

  // ✅ Updated to include "confirmed"
  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      ready: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      confirmed: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status];
  };

  // ✅ Updated to include "confirmed"
  const getStatusIcon = (status: Order["status"]) => {
    const icons = {
      pending: "⏳",
      preparing: "👨‍🍳",
      ready: "✅",
      completed: "📦",
      cancelled: "❌",
      confirmed: "✓",
    };
    return icons[status];
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
        
        if (selectedOrder?._id === id) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
        
        alert(`Order status updated to ${status}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating status");
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNextStatus = (currentStatus: Order["status"]) => {
    const flow: Record<Order["status"], Order["status"] | null> = {
      pending: "preparing",
      preparing: "ready",
      ready: "completed",
      completed: null,
      cancelled: null,
      confirmed: null, // Bookings use a different flow
    };
    return flow[currentStatus];
  };

  const pendingCount = orders.filter(o => o.status === "pending").length + 
                      bookings.filter(b => b.status === "pending").length;
  const preparingCount = orders.filter(o => o.status === "preparing").length;
  const readyCount = orders.filter(o => o.status === "ready").length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle booking-specific actions
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });

      if (response.ok) {
        setBookings(prev => prev.map(b => 
          b._id === bookingId ? { ...b, status: "confirmed" } : b
        ));
        alert("Booking accepted! You can now set the price.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to accept booking");
      }
    } catch (err) {
      console.error("Accept booking error:", err);
      alert("Error accepting booking");
    }
  };

  const handleSetBookingPrice = async (bookingId: string) => {
    const price = prompt("Enter the price for this booking:");
    if (price && !isNaN(Number(price))) {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/price`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total: Number(price) }),
        });

        if (response.ok) {
          setBookings(prev => prev.map(b => 
            b._id === bookingId ? { ...b, total: Number(price) } : b
          ));
          alert("Price set successfully!");
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(errorData.error || "Failed to set price");
        }
      } catch (err) {
        console.error("Set price error:", err);
        alert("Error setting price");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all customer orders and bookings</p>
          </div>
          
          {/* Stats Overview */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-w-32">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-w-32">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👨‍🍳</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{preparingCount}</p>
                  <p className="text-sm text-gray-500">Preparing</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-w-32">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{readyCount}</p>
                  <p className="text-sm text-gray-500">Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug info - remove in production */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Debug:</strong> Orders: {orders.length} | Bookings: {bookings.length} | Total: {orders.length + bookings.length}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {["all", "orders", "bookings"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    filter === type
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {type === "all" ? "All" : type === "orders" ? "Meal Orders" : "Chef Bookings"}
                </button>
              ))}
            </div>
            
            <div className="flex gap-1 overflow-x-auto pb-2">
              {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredData.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
                        {order.serviceType === "booking" && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                            Booking
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{order.customer.name}</p>
                      {order.customer.phone && (
                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      <span className="mr-1">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Placed {getTimeAgo(order.createdAt)}</span>
                    <span className="font-semibold text-gray-900">
                      ₦{order.total.toLocaleString()}
                      {order.total === 0 && order.serviceType === "booking" && " (To be set)"}
                    </span>
                  </div>
                  
                  {order.serviceType === "booking" && order.date && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Event: </span>
                      {formatDate(order.date)} at {order.time}
                      {order.guests && ` • ${order.guests} guests`}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="p-6">
                  {order.serviceType === "booking" ? (
                    <>
                      <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Event:</span> {order.notes || "No details provided"}
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Location:</span> {order.deliveryAddress || "To be confirmed"}
                        </div>
                        {order.guests && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Guests:</span> {order.guests} people
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                              <span className="text-gray-700">
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                            <span className="text-gray-900 font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {order.specialInstructions && order.serviceType !== "booking" && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">Note:</span> {order.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-2">
                    {order.status !== "completed" && order.status !== "cancelled" && order.serviceType !== "booking" && (
                      <button
                        onClick={() => updateOrderStatus(order._id, getNextStatus(order.status)!)}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        {order.status === "pending" && "Start Preparing"}
                        {order.status === "preparing" && "Mark as Ready"}
                        {order.status === "ready" && "Complete Order"}
                      </button>
                    )}

                    {order.serviceType === "booking" && order.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAcceptBooking(order._id)}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          Accept Booking
                        </button>
                        <button
                          onClick={() => handleSetBookingPrice(order._id)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                        >
                          Set Price
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                      View
                    </button>
                    
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateOrderStatus(order._id, "cancelled")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {filter === "all" ? "orders or bookings" : filter} found
            </h3>
            <p className="text-gray-500">
              {filter === "bookings" 
                ? "When customers book you for events, they'll appear here."
                : "When customers place orders, they'll appear here."}
            </p>
          </motion.div>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h2>
                        {selectedOrder.serviceType === "booking" && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                            Chef Booking
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{selectedOrder.customer.name}</p>
                      {selectedOrder.customer.email && (
                        <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                      )}
                      {selectedOrder.customer.phone && (
                        <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </div>
                    <span className="text-gray-500">Placed {getTimeAgo(selectedOrder.createdAt)}</span>
                    <span className="text-gray-500">Payment: {selectedOrder.paymentStatus || "pending"}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {selectedOrder.serviceType === "booking" ? "Booking Details" : "Order Items"}
                      </h3>
                      
                      {selectedOrder.serviceType === "booking" ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                            <div className="space-y-2">
                              {selectedOrder.date && (
                                <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.date)}</p>
                              )}
                              {selectedOrder.time && (
                                <p><span className="font-medium">Time:</span> {selectedOrder.time}</p>
                              )}
                              {selectedOrder.guests && (
                                <p><span className="font-medium">Guests:</span> {selectedOrder.guests} people</p>
                              )}
                              {selectedOrder.deliveryAddress && (
                                <p><span className="font-medium">Location:</span> {selectedOrder.deliveryAddress}</p>
                              )}
                            </div>
                          </div>
                          {(selectedOrder.notes || selectedOrder.specialInstructions) && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                              <p className="text-gray-700">{selectedOrder.notes || selectedOrder.specialInstructions}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">₦{item.price.toLocaleString()} each</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                        <div className="flex justify-between items-center text-white">
                          <span className="font-semibold">Total Amount</span>
                          <span className="text-xl font-bold">
                            ₦{selectedOrder.total.toLocaleString()}
                            {selectedOrder.total === 0 && selectedOrder.serviceType === "booking" && " (Price to be set)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                      <div className="space-y-3">
                        {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                          <>
                            {selectedOrder.serviceType === "booking" ? (
                              <>
                                {selectedOrder.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleAcceptBooking(selectedOrder._id);
                                        setSelectedOrder(null);
                                      }}
                                      className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                                    >
                                      Accept Booking Request
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleSetBookingPrice(selectedOrder._id);
                                      }}
                                      className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                                    >
                                      Set Booking Price
                                    </button>
                                  </>
                                )}
                                {selectedOrder.status === "confirmed" && selectedOrder.total === 0 && (
                                  <button
                                    onClick={() => handleSetBookingPrice(selectedOrder._id)}
                                    className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                                  >
                                    Set Final Price
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  updateOrderStatus(selectedOrder._id, getNextStatus(selectedOrder.status)!);
                                  setSelectedOrder(null);
                                }}
                                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                              >
                                {selectedOrder.status === "pending" && "Start Preparing"}
                                {selectedOrder.status === "preparing" && "Mark as Ready"}
                                {selectedOrder.status === "ready" && "Complete Order"}
                              </button>
                            )}
                          </>
                        )}
                        
                        {selectedOrder.status === "pending" && (
                          <button
                            onClick={() => {
                              updateOrderStatus(selectedOrder._id, "cancelled");
                              setSelectedOrder(null);
                            }}
                            className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                          >
                            Cancel {selectedOrder.serviceType === "booking" ? "Booking" : "Order"}
                          </button>
                        )}

                        {(selectedOrder.specialInstructions || selectedOrder.notes) && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {selectedOrder.serviceType === "booking" ? "Customer Notes" : "Special Instructions"}
                            </h4>
                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              {selectedOrder.notes || selectedOrder.specialInstructions}
                            </p>
                          </div>
                        )}

                        {selectedOrder.deliveryAddress && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {selectedOrder.serviceType === "booking" ? "Event Location" : "Delivery Address"}
                            </h4>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                              {selectedOrder.deliveryAddress}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}