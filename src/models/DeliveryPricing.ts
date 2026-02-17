import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryPricing extends Document {
  baseLocation: string; // Eziobodo, Umuchima, Back gate
  deliveryAreas: {
    area: string;
    price: number;
  }[];
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const DeliveryPricingSchema = new Schema<IDeliveryPricing>({
  baseLocation: {
    type: String,
    required: true,
    unique: true,
    enum: ['Eziobodo', 'Umuchima', 'Back gate']
  },
  deliveryAreas: [{
    area: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
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

DeliveryPricingSchema.index({ baseLocation: 1 });

export default mongoose.models.DeliveryPricing || 
  mongoose.model<IDeliveryPricing>('DeliveryPricing', DeliveryPricingSchema);