import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import models
import Wallet from '@/models/Wallet';
import ChildOrder from '@/models/ChildOrder';

// Commission rates
const COMMISSION_RATES: Record<string, number> = {
  chef: 0.15,
  pharmacy: 0.12,
  vendor: 0.10,
  topvendor: 0.08,
  rider: 0.20,
  platform: 0.00
};

interface VendorGroup {
  vendorId: string;
  vendorRole: string;
  totalVendorAmount: number;
  totalCommission: number;
  totalSubtotal: number;
  orderCount: number;
}

async function createWalletsFromChildOrders(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as mongoose.ConnectOptions);
    
    console.log('✅ Connected to MongoDB');
    
    // Get all PAID child orders
    console.log('Fetching child orders...');
    const childOrders = await ChildOrder.find({ status: 'PAID' });
    
    console.log(`📊 Found ${childOrders.length} paid child orders`);
    
    // Group by vendorId and vendorRole
    const vendorGroups = new Map<string, VendorGroup>();
    
    childOrders.forEach((order) => {
      const vendorId = order.vendorId.toString();
      const vendorRole = order.vendorRole || 'vendor';
      const subtotal = order.subtotal || 0;
      
      // Calculate amounts
      const commissionRate = COMMISSION_RATES[vendorRole] || 0.10;
      const commission = subtotal * commissionRate;
      const vendorAmount = subtotal - commission;
      
      const key = `${vendorId}_${vendorRole}`;
      
      if (!vendorGroups.has(key)) {
        vendorGroups.set(key, {
          vendorId,
          vendorRole,
          totalVendorAmount: vendorAmount,
          totalCommission: commission,
          totalSubtotal: subtotal,
          orderCount: 1
        });
      } else {
        const group = vendorGroups.get(key)!;
        group.totalVendorAmount += vendorAmount;
        group.totalCommission += commission;
        group.totalSubtotal += subtotal;
        group.orderCount += 1;
      }
    });
    
    console.log(`👥 Found ${vendorGroups.size} unique vendor-role combinations`);
    
    // Process each vendor group
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const [key, group] of vendorGroups.entries()) {
      try {
        // Check if wallet already exists
        let wallet = await Wallet.findOne({ 
          userId: group.vendorId, 
          role: group.vendorRole 
        });
        
        if (!wallet) {
          // Create new wallet
          wallet = new Wallet({
            userId: group.vendorId,
            role: group.vendorRole,
            balance: group.totalVendorAmount,
            pendingBalance: 0,
            totalEarned: group.totalVendorAmount,
            currency: 'NGN',
            createdAt: new Date()
          });
          
          await wallet.save();
          createdCount++;
          console.log(`✅ Created wallet for ${group.vendorId} (${group.vendorRole}): ₦${group.totalVendorAmount}`);
        } else {
          // Update existing wallet
          wallet.balance += group.totalVendorAmount;
          wallet.totalEarned += group.totalVendorAmount;
          await wallet.save();
          updatedCount++;
          console.log(`🔄 Updated wallet for ${group.vendorId} (${group.vendorRole}): +₦${group.totalVendorAmount}`);
        }
      } catch (error) {
        console.error(`❌ Error processing wallet for ${key}:`, error);
      }
    }
    
    // Also create platform wallet if it doesn't exist
    const PLATFORM_USER_ID = process.env.PLATFORM_USER_ID || '65f0c0a1e4b0a1b2c3d4e5f6';
    const platformWallet = await Wallet.findOne({
      userId: PLATFORM_USER_ID,
      role: 'platform'
    });
    
    if (!platformWallet) {
      const newPlatformWallet = new Wallet({
        userId: PLATFORM_USER_ID,
        role: 'platform',
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        currency: 'NGN',
        bankDetails: {
          bankCode: '000',
          accountNumber: 'PLATFORM001',
          accountName: 'Platform Wallet'
        }
      });
      await newPlatformWallet.save();
      console.log('✅ Created platform wallet');
    }
    
    console.log('\n📈 SUMMARY:');
    console.log(`   Total vendor groups: ${vendorGroups.size}`);
    console.log(`   Wallets created: ${createdCount}`);
    console.log(`   Wallets updated: ${updatedCount}`);
    console.log(`   Total child orders processed: ${childOrders.length}`);
    
    // Calculate totals
    const totalVendorAmount = Array.from(vendorGroups.values())
      .reduce((sum, group) => sum + group.totalVendorAmount, 0);
    
    const totalCommission = Array.from(vendorGroups.values())
      .reduce((sum, group) => sum + group.totalCommission, 0);
    
    console.log(`\n💰 FINANCIAL SUMMARY:`);
    console.log(`   Total vendor earnings: ₦${totalVendorAmount.toFixed(2)}`);
    console.log(`   Total platform commission: ₦${totalCommission.toFixed(2)}`);
    console.log(`   Total transaction volume: ₦${(totalVendorAmount + totalCommission).toFixed(2)}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
createWalletsFromChildOrders();