import mongoose, { Schema } from "mongoose";

const ProviderSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["pharmacy", "chef", "vendor", "topVendor", "rider"],
      required: true,
    },
    email: String,
    phone: String,
    address: String,
    isApproved: { type: Boolean, default: false },
    status: { type: String, default: "pending" },   // added for approval flow
    approvedAt: Date,
  },
  { timestamps: true }
);

// Use existing model or create a new one
const Provider = mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);
export default Provider;