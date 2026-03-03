import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    // ========== TYPE = CREDIT/DEBIT ==========
    type: {
      type: String,
      required: true,
      enum: ["CREDIT", "DEBIT"],
    },

    // ========== SOURCE = WHERE THE MONEY CAME FROM ==========
    source: {
      type: String,
      required: true,
      enum: [
        "ORDER_PAYMENT",  // Vendor gets paid
        "COMMISSION",     // Platform earns commission
        "WITHDRAWAL",     // Vendor withdraws money
        "REFUND",         // Money returned
        "TOPUP",          // Manual wallet top-up
        "DELIVERY_FEE",   // Rider earnings
      ],
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ✅ CHANGED: String – supports both ObjectId strings and "platform" ID
    userId: {
      type: String,
      required: true,
    },

    // 🔥 MUST MATCH WALLET ROLES EXACTLY
    role: {
      type: String,
      required: true,
      enum: ["chef", "vendor", "pharmacy", "topvendor", "rider", "platform"],
    },

    // ✅ ADDED: Human-readable description
    description: {
      type: String,
      default: "",
    },

    // ========== LINKS ==========
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // ✅ ADDED: Link to specific child order (important for auditing)
    childOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChildOrder",
    },

    // ❌ REMOVED: walletId – not required, wallet is identified by userId+role
    // Optional: if you want to keep it, make it NOT required
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: false, // Not mandatory – can be filled later if needed
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },

    reference: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// 🔥 INDEXES – optimize queries
TransactionSchema.index({ userId: 1, role: 1, createdAt: -1 });
TransactionSchema.index({ orderId: 1 });
TransactionSchema.index({ childOrderId: 1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);