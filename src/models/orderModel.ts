import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customer: {
      name: String,
      phone: String,
      email: String,
    },

    delivery: {
      address: String,
      method: { type: String, default: "delivery" },
    },

    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    // ===== EXISTING =====
    serviceType: { type: String, default: "order" },
    providerId: String,
    chefId: String,
    assignedRiderId: String,
    status: { type: String, default: "pending" },
    total: { type: Number, default: 0 },

    // ===== BOOKING FIELDS (ADDED) =====
    date: Date,
    time: String,
    guests: Number,
    eventAddress: String,
    notes: String,
    paymentMethod: String,
    paymentStatus: String,
    createdBy: String,
  },
  { timestamps: true }
);

export default models.Order || mongoose.model("Order", OrderSchema);