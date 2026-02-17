import { Schema, models, model } from "mongoose";

const BusinessHourSchema = new Schema(
  {
    day: String,
    open: Boolean,
    openingTime: String,
    closingTime: String,
  },
  { _id: false }
);

const VendorSchema = new Schema(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: String,

    pickupZone: {
      type: String,
      enum: [
        "EZIOBODO",
        "EZIOBODO_MARKET",
        "INSIDE_SCHOOL",
        "UMUCHIMA",
        "BACK_GATE",
        "IHIAGWA",
        "IHIAGWA_MARKET",
        "FUTO_GATE_ROAD",
        "FUTO_JUNCTION",
        "REDEMPTION_ESTATE",
        "AVU_JUNCTION",
        "HOSPITAL_JUNCTION",
        "WORLD_BANK",
        "POLY_JUNCTION",
      ],
      required: true,
    },

    pickupPhone: { type: String, required: true },
    pickupAddress: String,

    category: { type: String, default: "vendor" },
    logoUrl: String,
    bio: String,

    businessHours: {
      type: [BusinessHourSchema],
      default: [],
    },

    approved: { type: Boolean, default: false },
    role: { type: String, default: "vendor" },

    // 💰 Wallet for earnings
    wallet: {
      balance: { type: Number, default: 0 },     // Available to withdraw
      pending: { type: Number, default: 0 },     // Waiting for delivery completion
      totalEarned: { type: Number, default: 0 }, // Lifetime earnings
    },
  },
  { timestamps: true }
);

export default models.Vendor || model("Vendor", VendorSchema);