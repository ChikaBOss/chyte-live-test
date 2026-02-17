// src/models/DeliveryJob.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDeliveryJob extends Document {
  orderId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  dropAddress: string;
  customerLocation?: string;
  deliveryFee: number;
  status: string;
  riderId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  expiresAt?: Date;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeliveryJobSchema = new Schema<IDeliveryJob>(
  {
    orderId: { 
      type: Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    customerName: { 
      type: String, 
      required: true 
    },
    customerPhone: { 
      type: String, 
      required: true 
    },
    dropAddress: { 
      type: String, 
      required: true 
    },
    customerLocation: { 
      type: String 
    },
    deliveryFee: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ["PENDING", "ASSIGNED", "PICKED_UP", "DELIVERED", "CANCELLED", "FAILED"],
      default: "PENDING"
    },
    riderId: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    assignedAt: { 
      type: Date 
    },
    pickedUpAt: { 
      type: Date 
    },
    deliveredAt: { 
      type: Date 
    },
    expiresAt: { 
      type: Date 
    },
    metadata: { 
      type: Schema.Types.Mixed 
    },
  },
  { timestamps: true }
);

// Index for faster queries
DeliveryJobSchema.index({ orderId: 1 });
DeliveryJobSchema.index({ status: 1 });
DeliveryJobSchema.index({ riderId: 1 });
DeliveryJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.DeliveryJob || mongoose.model<IDeliveryJob>("DeliveryJob", DeliveryJobSchema);