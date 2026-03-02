// models/Rider.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRider extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  approved: boolean;
  status: "pending" | "approved" | "suspended";
  documents?: {
    name: string;
    type: string;
    url: string;
    publicId?: string;
  }[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  earnings?: number;
  approvedAt?: Date;
  approvedBy?: string;
  isActive: boolean;          // new field
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema = new Schema<IRider>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    approved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
    documents: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
    },
    earnings: { type: Number, default: 0 },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    isActive: { type: Boolean, default: true },   // new field
  },
  { timestamps: true }
);

const Rider = mongoose.models.Rider || mongoose.model<IRider>("Rider", RiderSchema);
export default Rider;