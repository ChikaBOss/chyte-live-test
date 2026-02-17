import mongoose from 'mongoose';

const PlatformSettingsSchema = new mongoose.Schema({
  commissionPercentage: {
    type: Number,
    default: 1.5,
    min: 0,
    max: 100
  },
  minimumWithdrawal: {
    type: Number,
    default: 1000 // 1000 Naira minimum
  },
  withdrawalFee: {
    type: Number,
    default: 50 // 50 Naira fee per withdrawal
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.PlatformSettings || 
  mongoose.model('PlatformSettings', PlatformSettingsSchema);