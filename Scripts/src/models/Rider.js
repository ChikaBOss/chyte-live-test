"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/Rider.ts
const mongoose_1 = require("mongoose");
const RiderSchema = new mongoose_1.Schema({
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
    isActive: { type: Boolean, default: true }, // new field
}, { timestamps: true });
const Rider = mongoose_1.default.models.Rider || mongoose_1.default.model("Rider", RiderSchema);
exports.default = Rider;
