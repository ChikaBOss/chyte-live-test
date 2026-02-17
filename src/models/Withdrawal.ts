import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  role: {
    type: String,
    required: true,
    enum: ['vendor', 'rider']
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1000 // Minimum withdrawal
  },
  fee: {
    type: Number,
    default: 50
  },
  netAmount: {
    type: Number,
    required: true
  },
  bankDetails: {
    bankCode: String,
    accountNumber: String,
    accountName: String,
    bankName: String
  },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'PROCESSING', 'APPROVED', 'COMPLETED', 'REJECTED', 'FAILED']
  },
  paystackTransferCode: String,
  failureReason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  completedAt: Date
}, { timestamps: true });

export default mongoose.models.Withdrawal || 
  mongoose.model('Withdrawal', WithdrawalSchema);