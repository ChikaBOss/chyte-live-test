import mongoose, { Schema, models, model } from "mongoose";

const TopVendorProductSchema = new Schema(
  {
    topVendorId: {
      type: Schema.Types.ObjectId,
      ref: "TopVendor",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    ingredients: {
      type: [String],
      default: [],
    },

    preparationTime: {
      type: Number,
      default: 0,
    },

    imageUrl: {
      type: String,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TopVendorProduct =
  models.TopVendorProduct ||
  model("TopVendorProduct", TopVendorProductSchema);

export default TopVendorProduct;