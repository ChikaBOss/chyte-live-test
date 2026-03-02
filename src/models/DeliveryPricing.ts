// models/DeliveryPricing.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryPricing extends Document {
  baseLocation: string; // Eziobodo, Umuchima, Back gate
  deliveryAreas: {
    area: string;
    price: number;
  }[];
  companyId: mongoose.Types.ObjectId;   // new field
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const DeliveryPricingSchema = new Schema<IDeliveryPricing>({
  baseLocation: {
    type: String,
    required: true,
    enum: ['Eziobodo', 'Umuchima', 'Back gate']
  },
  deliveryAreas: [{
    area: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
  companyId: {                             // new field
    type: Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
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

export default mongoose.models.DeliveryPricing || 
  mongoose.model<IDeliveryPricing>('DeliveryPricing', DeliveryPricingSchema);