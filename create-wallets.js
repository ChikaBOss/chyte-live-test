// create-wallets.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createWallets() {
  console.log('🚀 Creating wallets from existing child orders...\n');
  
  // Use the correct connection string
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('test');
    
    // Get all child orders
    const childOrders = await db.collection('childorders').find({}).toArray();
    console.log(`📦 Found ${childOrders.length} child orders\n`);
    
    // Group by vendor and role
    const vendorMap = new Map();
    
    for (const order of childOrders) {
      const vendorId = order.vendorId;
      const role = order.vendorRole || 'vendor';
      const subtotal = order.subtotal || 0;
      
      // Commission rates based on role
      const commissionRates = {
        chef: 0.15,
        pharmacy: 0.12,
        vendor: 0.10,
        topvendor: 0.08
      };
      
      const commissionRate = commissionRates[role] || 0.10;
      const commission = subtotal * commissionRate;
      const vendorAmount = subtotal - commission;
      
      const key = `${vendorId}-${role}`;
      
      if (!vendorMap.has(key)) {
        vendorMap.set(key, {
          vendorId,
          role,
          totalVendorAmount: vendorAmount,
          totalCommission: commission,
          totalSubtotal: subtotal,
          orderCount: 1
        });
      } else {
        const existing = vendorMap.get(key);
        existing.totalVendorAmount += vendorAmount;
        existing.totalCommission += commission;
        existing.totalSubtotal += subtotal;
        existing.orderCount += 1;
      }
    }
    
    console.log(`👥 Found ${vendorMap.size} unique vendor-role combinations\n`);
    
    // Create wallets
    const walletsCollection = db.collection('wallets');
    let created = 0;
    let updated = 0;
    
    for (const [key, vendor] of vendorMap) {
      try {
        // Check if wallet already exists
        const existingWallet = await walletsCollection.findOne({
          userId: vendor.vendorId,
          role: vendor.role
        });
        
        if (!existingWallet) {
          // Create new wallet
          await walletsCollection.insertOne({
            userId: new ObjectId(vendor.vendorId),
            role: vendor.role,
            balance: vendor.totalVendorAmount,
            pendingBalance: 0,
            totalEarned: vendor.totalVendorAmount,
            totalWithdrawn: 0,
            currency: 'NGN',
            bankDetails: null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          created++;
          console.log(`✅ Created wallet for ${vendor.vendorId.slice(0, 8)}... (${vendor.role}): ₦${vendor.totalVendorAmount.toFixed(2)}`);
        } else {
          // Update existing wallet
          await walletsCollection.updateOne(
            { _id: existingWallet._id },
            {
              $set: {
                balance: existingWallet.balance + vendor.totalVendorAmount,
                totalEarned: existingWallet.totalEarned + vendor.totalVendorAmount,
                updatedAt: new Date()
              }
            }
          );
          updated++;
          console.log(`🔄 Updated wallet for ${vendor.vendorId.slice(0, 8)}... (${vendor.role}): +₦${vendor.totalVendorAmount.toFixed(2)}`);
        }
      } catch (error) {
        console.log(`❌ Error processing ${key}:`, error.message);
      }
    }
    
    // Create platform wallet if it doesn't exist
    const platformUserId = "65f0c0a1e4b0a1b2c3d4e5f6"; // Example platform user ID
    const platformWallet = await walletsCollection.findOne({
      userId: platformUserId,
      role: 'platform'
    });
    
    if (!platformWallet) {
      await walletsCollection.insertOne({
        userId: platformUserId,
        role: 'platform',
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        currency: 'NGN',
        bankDetails: {
          bankCode: '000',
          accountNumber: 'PLATFORM001',
          accountName: 'Platform Wallet'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('\n✅ Created platform wallet');
    }
    
    // Show summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total child orders: ${childOrders.length}`);
    console.log(`   Unique vendors: ${vendorMap.size}`);
    console.log(`   Wallets created: ${created}`);
    console.log(`   Wallets updated: ${updated}`);
    
    // Calculate totals
    let totalVendorAmount = 0;
    let totalCommission = 0;
    
    for (const vendor of vendorMap.values()) {
      totalVendorAmount += vendor.totalVendorAmount;
      totalCommission += vendor.totalCommission;
    }
    
    console.log('\n💰 FINANCIAL TOTALS:');
    console.log(`   Total vendor earnings: ₦${totalVendorAmount.toFixed(2)}`);
    console.log(`   Total platform commission: ₦${totalCommission.toFixed(2)}`);
    console.log(`   Total transaction volume: ₦${(totalVendorAmount + totalCommission).toFixed(2)}`);
    
    console.log('\n🎉 WALLET CREATION COMPLETE!');
    console.log('✨ Now restart your Next.js app and check vendor dashboards!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

createWallets();