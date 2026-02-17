import { Schema, model, models } from "mongoose";

const BusinessHoursSchema = new Schema(
  {
    day: { type: String, required: true },
    open: { type: Boolean, default: false },
    openingTime: { type: String, default: "09:00" },
    closingTime: { type: String, default: "22:00" },
  },
  { _id: false }
);

const ChefSchema = new Schema(
  {
    // Authentication
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Identity
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },

    // 📍 DELIVERY LOCATION (UNIFIED STRUCTURE)
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
    pickupAddress: { type: String },

    // Profile (optional)
    displayName: { type: String },
    bio: { type: String },
    experience: { type: String },
    specialties: { type: String },
    avatarUrl: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    minOrder: { type: Number, default: 1000 },

    businessHours: { type: [BusinessHoursSchema], default: [] },

    // System
    approved: { type: Boolean, default: false },
    status: { type: String, default: "pending" },
    role: { type: String, default: "chef" },
  },
  { timestamps: true }
);

const Chef = models.Chef || model("Chef", ChefSchema);
export default Chef;