"use client";
import { motion } from "framer-motion";

export function DeliveryCard({ delivery, onStatusChange }) {
  const { id, customer, phone, pickup, dropoff, price, status, items } = delivery;

  const handleAccept = () => {
    onStatusChange("ongoing");
  };

  const handleComplete = () => {
    onStatusChange("completed");
  };

  const statusConfig = {
    pending: { color: "bg-yellow-500", text: "New Request", icon: "🆕" },
    ongoing: { color: "bg-blue-500", text: "In Progress", icon: "🚗" },
    completed: { color: "bg-green", text: "Completed", icon: "✅" }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg border border-mustard/20 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-dark"
          >
            {customer}
          </motion.h3>
          <p className="text-olive text-sm">{phone}</p>
          <p className="text-dark/50 text-xs">Order #{id}</p>
        </div>
        
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`px-4 py-2 rounded-full text-sm font-bold text-cream ${config.color} flex items-center gap-2`}
        >
          {config.icon} {config.text}
        </motion.span>
      </div>

      {/* Route */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-4 p-4 bg-cream rounded-xl"
      >
        <div className="text-center">
          <div className="w-3 h-3 bg-green rounded-full"></div>
          <p className="text-xs text-dark/70 mt-1">Pickup</p>
          <p className="text-sm font-semibold text-dark">{pickup}</p>
        </div>
        
        <div className="flex-1 mx-4 relative">
          <div className="h-0.5 bg-mustard/30"></div>
          <motion.div 
            className="absolute top-1/2 left-0 w-6 h-6 bg-dark text-cream rounded-full flex items-center justify-center text-xs"
            animate={{ x: status === 'completed' ? '100%' : '0%' }}
            transition={{ duration: 2, repeat: status === 'ongoing' ? Infinity : 0 }}
          >
            🛵
          </motion.div>
        </div>
        
        <div className="text-center">
          <div className="w-3 h-3 bg-green rounded-full"></div>
          <p className="text-xs text-dark/70 mt-1">Dropoff</p>
          <p className="text-sm font-semibold text-dark">{dropoff}</p>
        </div>
      </motion.div>

      {/* Items & Price */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-dark font-semibold mb-2">Items:</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-mustard/10 text-dark rounded-full text-sm"
              >
                {item.name} × {item.quantity}
              </motion.span>
            ))}
          </div>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-right"
        >
          <p className="text-dark/70 text-sm">Delivery Fee</p>
          <p className="text-2xl font-bold text-green">₦{price.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        {status === "pending" && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            className="flex-1 bg-green text-cream py-3 rounded-xl font-bold hover:bg-green/90 transition-colors shadow-lg"
          >
            ✅ Accept Delivery
          </motion.button>
        )}
        
        {status === "ongoing" && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            className="flex-1 bg-dark text-cream py-3 rounded-xl font-bold hover:bg-dark/90 transition-colors shadow-lg"
          >
            🎉 Mark Complete
          </motion.button>
        )}

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 border border-dark text-dark rounded-xl font-bold hover:bg-cream transition-colors"
        >
          📞 Call
        </motion.button>
      </motion.div>
    </motion.div>
  );
}