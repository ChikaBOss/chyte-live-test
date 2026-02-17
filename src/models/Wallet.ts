import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: String,           // ✅ Correct: use capital String
      required: true,
      // ref: "User",          // optional if you need population
    },

    role: {
      type: String,
      required: true,
      enum: [
        "chef",
        "vendor",
        "pharmacy",
        "topvendor",
        "rider",
        "platform",
      ],
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarned: {
      type: Number,
      default: 0,
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
    },

    bankDetails: {
      bankCode: String,
      accountNumber: String,
      accountName: String,
    },
  },
  { timestamps: true }
);

// 🔥 CRITICAL: ONE wallet per (userId + role)
WalletSchema.index({ userId: 1, role: 1 }, { unique: true });

export default mongoose.models.Wallet ||
  mongoose.model("Wallet", WalletSchema);