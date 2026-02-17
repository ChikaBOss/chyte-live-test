import { Schema, model, models } from "mongoose";

export type Role = "admin" | "pharmacy" | "chef" | "vendor" | "topvendor" | "rider";

const AccountSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin","pharmacy","chef","vendor","topvendor","rider"], required: true },
    company: { type: String, default: "" },
    approved: { type: Boolean, default: false },   // <-- admin must approve
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Account = models.Account || model("Account", AccountSchema);