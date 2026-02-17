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

const TopVendorSchema = new Schema(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Public business phone (visible to admin / users if needed)
    phone: String,

    // 📍 Delivery-related fields (IMPORTANT)
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
        "NEW_OWERRI",
        "POLY_JUNCTION",
      ],
      required: true,
    },

    // Phone number riders will call
    pickupPhone: { type: String, required: true },

    // Shop / lodge name or extra description
    pickupAddress: String,

    category: String,
    specialty: String,

    logoUrl: String,
    bio: String,

    rating: { type: Number, default: 4.5 },

    businessHours: {
      type: [BusinessHourSchema],
      default: [],
    },

    approved: { type: Boolean, default: false },
    role: { type: String, default: "top-vendor" },
  },
  { timestamps: true }
);

export default models.TopVendor || model("TopVendor", TopVendorSchema);