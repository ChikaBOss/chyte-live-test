import mongoose, { Schema, models, model } from "mongoose";

const PharmacyProductSchema = new Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    available: {
      type: Boolean,
      default: true,
    },

    category: String,
    stock: Number,
    tags: [String],
    manufacturer: String,
    expiryDate: String,
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PharmacyProduct =
  models.PharmacyProduct ||
  model("PharmacyProduct", PharmacyProductSchema);

export default PharmacyProduct;