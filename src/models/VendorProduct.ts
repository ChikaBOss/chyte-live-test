// models/VendorProduct.js or .ts
import mongoose from "mongoose";

const VendorProductSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  description: {
    type: String,
    default: "",
  },
  available: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
  },
  stock: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  unit: {
    type: String,
    default: "item",
  },
}, {
  timestamps: true,
});

export default mongoose.models.VendorProduct || 
  mongoose.model("VendorProduct", VendorProductSchema);