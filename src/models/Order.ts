import mongoose, { Schema, Document, models } from "mongoose";

export interface IOrder extends Document {
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
  };

  // ✅ UPDATED: Support multiple vendors
  vendorGroups: {
    vendorId: mongoose.Types.ObjectId | string;
    vendorName: string;
    vendorRole: "chef" | "vendor" | "pharmacy" | "topvendor";
    vendorBaseLocation?: string;
    items: any[];
    subtotal: number;
    commissionRate?: number;
    commissionAmount?: number;
    payoutAmount?: number;
    paid?: boolean;
    paidAt?: Date;
  }[];

  // ✅ UPDATED: Array of vendor IDs for quick reference
  vendorIds: (mongoose.Types.ObjectId | string)[];
  
  // ✅ UPDATED: Array of vendor roles for filtering
  vendorRoles: ("chef" | "vendor" | "pharmacy" | "topvendor")[];

  riderId?: mongoose.Types.ObjectId;

  // ✅ UPDATED: Selected vendors from checkout
  selectedVendors?: string[];

  deliveryMethod: "SITE_COMPANY" | "SELF_PICKUP" | "OWN_RIDER" | "VENDOR_RIDER";
  deliveryDetails?: any;
  deliveryFee: number;

  subtotal: number;
  adminFee: number;
  totalAmount: number;

  payment: {
    provider?: "PAYSTACK";
    reference?: string;
    paidAt?: Date;
    status: "PENDING" | "PAID" | "FAILED";
  };

  // ✅ UPDATED: Multi-vendor distribution
  distribution?: {
    vendorDistributions: {
      vendorId: mongoose.Types.ObjectId | string;
      vendorName: string;
      vendorRole: string;
      amount: number;
      commission: number;
      payout: number;
    }[];
    riderAmount: number;
    platformAmount: number;
    status: "PENDING" | "DISTRIBUTED";
    distributedAt?: Date;
  };

  status: "PENDING_PAYMENT" | "PAID" | "COMPLETED" | "CANCELLED";
}

const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },

    // ✅ UPDATED: Multi-vendor support
    vendorGroups: [
      {
        vendorId: { type: Schema.Types.Mixed, required: true }, // Can be ObjectId or string
        vendorName: { type: String, required: true },
        vendorRole: {
          type: String,
          enum: ["chef", "vendor", "pharmacy", "topvendor"],
          required: true
        },
        vendorBaseLocation: String,
        items: { type: Array, required: true },
        subtotal: { type: Number, required: true },
        commissionRate: Number,
        commissionAmount: Number,
        payoutAmount: Number,
        paid: { type: Boolean, default: false },
        paidAt: Date
      }
    ],

    // ✅ ADDED: For quick queries
    vendorIds: [{ type: Schema.Types.Mixed }],
    vendorRoles: [{
      type: String,
      enum: ["chef", "vendor", "pharmacy", "topvendor"]
    }],

    riderId: {
      type: Schema.Types.ObjectId,
    },

    selectedVendors: { type: [String] },

    deliveryMethod: {
      type: String,
      enum: ["SITE_COMPANY", "SELF_PICKUP", "OWN_RIDER", "VENDOR_RIDER"],
      required: true,
    },

    deliveryDetails: { type: Object },
    deliveryFee: { type: Number, default: 0 },

    subtotal: { type: Number, required: true },
    adminFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    payment: {
      provider: String,
      reference: String,
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
      },
      paidAt: Date,
    },

    // ✅ UPDATED: Multi-vendor distribution
    distribution: {
      vendorDistributions: [
        {
          vendorId: Schema.Types.Mixed,
          vendorName: String,
          vendorRole: String,
          amount: Number,
          commission: Number,
          payout: Number,
        }
      ],
      riderAmount: Number,
      platformAmount: Number,
      status: {
        type: String,
        enum: ["PENDING", "DISTRIBUTED"],
        default: "PENDING",
      },
      distributedAt: Date,
    },

    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PAID", "COMPLETED", "CANCELLED"],
      default: "PENDING_PAYMENT",
    },
  },
  { timestamps: true }
);

// ✅ ADDED: Indexes for better performance
OrderSchema.index({ "vendorGroups.vendorRole": 1 });
OrderSchema.index({ "vendorGroups.vendorId": 1 });
OrderSchema.index({ "payment.reference": 1 });
OrderSchema.index({ vendorIds: 1 });
OrderSchema.index({ vendorRoles: 1 });

export default models.Order || mongoose.model<IOrder>("Order", OrderSchema);