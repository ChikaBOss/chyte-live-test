// models/ChildOrder.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IChildOrder extends Document {
  parentOrderId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId | string;
  vendorName: string;
  vendorRole: "chef" | "vendor" | "pharmacy" | "topvendor" | "rider";

  items: {
    productId: mongoose.Types.ObjectId | string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  commissionRate?: number;
  commissionAmount?: number;
  vendorAmount?: number;

  deliveryMethod: "SITE_COMPANY" | "SELF_PICKUP" | "OWN_RIDER" | "VENDOR_RIDER";

  status: "PENDING" | "PAID" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  paidAt?: Date;

  pickupCode?: string;
}

const ChildOrderSchema = new Schema<IChildOrder>(
  {
    parentOrderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },

    vendorId: { type: Schema.Types.Mixed, required: true },
    vendorName: { type: String, required: true },
    vendorRole: {
      type: String,
      enum: ["chef", "vendor", "pharmacy", "topvendor", "rider"],
      required: true,
    },

    items: [
      {
        productId: { type: Schema.Types.Mixed, required: true },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    subtotal: { type: Number, required: true },
    commissionRate: { type: Number },
    commissionAmount: { type: Number },
    vendorAmount: { type: Number },

    deliveryMethod: {
      type: String,
      enum: ["SITE_COMPANY", "SELF_PICKUP", "OWN_RIDER", "VENDOR_RIDER"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "PREPARING", "READY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    paidAt: { type: Date },

    pickupCode: String,
  },
  { timestamps: true }
);

// Unique index: one child order per parent+vendor
ChildOrderSchema.index({ parentOrderId: 1, vendorId: 1 }, { unique: true });
// Index for fast earnings queries
ChildOrderSchema.index({ vendorId: 1, vendorRole: 1, status: 1, createdAt: -1 });

export default models.ChildOrder ||
  mongoose.model<IChildOrder>("ChildOrder", ChildOrderSchema);