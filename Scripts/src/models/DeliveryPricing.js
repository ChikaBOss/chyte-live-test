"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/DeliveryPricing.ts
const mongoose_1 = require("mongoose");
const DeliveryPricingSchema = new mongoose_1.Schema({
    baseLocation: {
        type: String,
        required: true,
        enum: ['Eziobodo', 'Umuchima', 'Back gate']
    },
    deliveryAreas: [{
            area: { type: String, required: true },
            price: { type: Number, required: true, min: 0 }
        }],
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Rider',
        required: true
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
// A company can have at most one pricing record per base location
DeliveryPricingSchema.index({ companyId: 1, baseLocation: 1 }, { unique: true });
exports.default = mongoose_1.default.models.DeliveryPricing ||
    mongoose_1.default.model('DeliveryPricing', DeliveryPricingSchema);
