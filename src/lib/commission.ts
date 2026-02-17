import mongoose from 'mongoose';  // <-- ADD THIS IMPORT
import PlatformSettings from '@/models/PlatformSettings';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import { v4 as uuidv4 } from 'uuid';

interface SplitResult {
  vendorAmount: number;
  riderAmount: number;
  platformAmount: number;
  total: number;
}

interface OrderDetails {
  orderId: any;
  totalAmount: number;
  vendorId: any;
  riderId: any;
  customerId: any;
  deliveryFee: number;
  itemsTotal: number;
}

/**
 * Calculate commission split for an order
 */
export async function calculateSplit(orderTotal: number): Promise<SplitResult> {
  const settings = await PlatformSettings.findOne();
  const commissionRate = settings?.commissionPercentage || 1.5;
  
  // Example split (adjust based on your business logic):
  // Platform takes 1.5% commission from vendor's earnings
  const platformAmount = (orderTotal * commissionRate) / 100;
  const vendorAmount = orderTotal - platformAmount;
  
  // Rider gets separate delivery fee (already included in orderTotal)
  // This is just example - modify based on your actual business model
  const riderAmount = 0; // Calculate based on delivery fee or percentage
  
  return {
    vendorAmount,
    riderAmount,
    platformAmount,
    total: orderTotal
  };
}

/**
 * Auto-distribute payment to wallets
 */
export async function distributeOrderPayment(orderDetails: OrderDetails): Promise<boolean> {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { orderId, totalAmount, vendorId, riderId, customerId, deliveryFee, itemsTotal } = orderDetails;
    
    // Get commission settings
    const settings = await PlatformSettings.findOne();
    const commissionRate = settings?.commissionPercentage || 1.5;
    
    // Calculate amounts
    const platformCommission = (itemsTotal * commissionRate) / 100;
    const vendorEarnings = itemsTotal - platformCommission;
    const riderEarnings = deliveryFee;
    
    // Create or get wallets
    const vendorWallet = await getOrCreateWallet(vendorId, 'vendor');
    const riderWallet = await getOrCreateWallet(riderId, 'rider');
    const platformWallet = await getOrCreatePlatformWallet();
    
    // Credit vendor wallet
    await creditWallet(vendorWallet._id, vendorEarnings, 'vendor', vendorId, 'ORDER_PAYMENT', orderId);
    
    // Credit rider wallet
    await creditWallet(riderWallet._id, riderEarnings, 'rider', riderId, 'ORDER_PAYMENT', orderId);
    
    // Credit platform wallet (commission)
    await creditWallet(platformWallet._id, platformCommission, 'platform', platformWallet.userId, 'COMMISSION', orderId);
    
    await session.commitTransaction();
    return true;
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Payment distribution failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Helper: Get or create wallet
 */
async function getOrCreateWallet(userId: any, role: 'vendor' | 'rider' | 'customer' | 'platform') {
  let wallet = await Wallet.findOne({ userId, role });
  
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      role,
      balance: 0,
      pendingBalance: 0,
      totalEarned: 0
    });
  }
  
  return wallet;
}

/**
 * Helper: Get platform wallet
 */
async function getOrCreatePlatformWallet() {
  // Platform wallet uses a fixed ID or finds existing
  const PLATFORM_ID = '000000000000000000000001'; // Fixed ObjectId for platform
  
  let wallet = await Wallet.findOne({ role: 'platform' });
  
  if (!wallet) {
    wallet = await Wallet.create({
      userId: PLATFORM_ID,
      role: 'platform',
      balance: 0,
      pendingBalance: 0,
      totalEarned: 0
    });
  }
  
  return wallet;
}

/**
 * Helper: Credit wallet and create transaction
 */
async function creditWallet(
  walletId: any,
  amount: number,
  role: string,
  userId: any,
  source: string,
  orderId?: any
) {
  const reference = `CREDIT_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
  
  // Update wallet balance
  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    {
      $inc: {
        balance: amount,
        totalEarned: amount
      }
    },
    { new: true }
  );
  
  // Create transaction record
  await Transaction.create({
    type: 'CREDIT',
    amount,
    userId,
    role,
    source,
    orderId,
    walletId,
    reference,
    status: 'COMPLETED',
    metadata: {
      description: `Payment for order ${orderId}`,
      autoDistributed: true
    }
  });
  
  return wallet;
}

/**
 * Admin: Update commission percentage
 */
export async function updateCommissionPercentage(newPercentage: number): Promise<boolean> {
  if (newPercentage < 0 || newPercentage > 100) {
    throw new Error('Commission must be between 0 and 100');
  }
  
  await PlatformSettings.findOneAndUpdate(
    {},
    { commissionPercentage: newPercentage, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  
  return true;
}