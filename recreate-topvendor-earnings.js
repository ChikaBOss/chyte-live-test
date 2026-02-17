// recreate-topvendor-earnings.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function recreateTopVendorEarnings() {
  console.log('⭐ Recreating top vendor earnings...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('test');
    
    const TOP_VENDOR_ID = '696b753cd13d0ca193c05f6f';
    
    // 1. First, update the role in topvendors collection
    await db.collection('topvendors').updateOne(
      { _id: new ObjectId(TOP_VENDOR_ID) },
      { $set: { role: 'topvendor' } }
    );
    console.log('✅ Updated top vendor role to "topvendor"');
    
    // 2. Delete existing top vendor child orders
    const deleteResult = await db.collection('childorders').deleteMany({
      vendorId: TOP_VENDOR_ID,
      vendorRole: { $in: ['topvendor', 'top-vendor'] }
    });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing top vendor orders`);
    
    // 3. Find all parent orders with top vendor items
    const parentOrders = await db.collection('orders').find({
      'vendorGroups.vendorId': TOP_VENDOR_ID
    }).toArray();
    
    console.log(`📦 Found ${parentOrders.length} parent orders with top vendor items`);
    
    let totalVendorAmount = 0;
    let totalSubtotal = 0;
    
    // 4. Recreate child orders with correct calculations (8% commission)
    for (const order of parentOrders) {
      const vendorGroup = order.vendorGroups.find(v => v.vendorId === TOP_VENDOR_ID);
      
      if (vendorGroup) {
        const subtotal = vendorGroup.subtotal || 0;
        const commissionRate = 0.08; // 8% for top vendor
        const commissionAmount = subtotal * commissionRate;
        const vendorAmount = subtotal - commissionAmount;
        
        const childOrder = {
          parentOrderId: order._id,
          vendorId: TOP_VENDOR_ID,
          vendorName: vendorGroup.vendorName || 'Top Vendor',
          vendorRole: 'topvendor', // Use without hyphen
          items: vendorGroup.items || [],
          subtotal: subtotal,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          vendorAmount: vendorAmount,
          status: 'PAID',
          paidAt: order.paidAt || order.createdAt || new Date(),
          createdAt: order.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('childorders').insertOne(childOrder);
        console.log(`✅ Created child order: ₦${subtotal.toLocaleString()} → You get ₦${vendorAmount.toLocaleString()}`);
        
        totalVendorAmount += vendorAmount;
        totalSubtotal += subtotal;
      }
    }
    
    console.log(`\n💰 Summary from orders:`);
    console.log(`   Total subtotal: ₦${totalSubtotal.toLocaleString()}`);
    console.log(`   Commission (8%): ₦${(totalSubtotal * 0.08).toLocaleString()}`);
    console.log(`   You get: ₦${totalVendorAmount.toLocaleString()}`);
    
    // 5. Update or create wallet
    await db.collection('wallets').updateOne(
      { userId: TOP_VENDOR_ID, role: 'topvendor' },
      {
        $set: {
          balance: totalVendorAmount,
          totalEarned: totalVendorAmount,
          pendingBalance: 0,
          currency: 'NGN',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`\n✅ Updated top vendor wallet to ₦${totalVendorAmount.toLocaleString()}`);
    
    // 6. Verify
    const finalOrders = await db.collection('childorders').find({
      vendorId: TOP_VENDOR_ID,
      vendorRole: 'topvendor'
    }).toArray();
    
    const finalWallet = await db.collection('wallets').findOne({
      userId: TOP_VENDOR_ID,
      role: 'topvendor'
    });
    
    console.log(`\n📊 Verification:`);
    console.log(`   Orders: ${finalOrders.length}`);
    console.log(`   Order total: ₦${finalOrders.reduce((sum, o) => sum + (o.vendorAmount || 0), 0).toLocaleString()}`);
    console.log(`   Wallet balance: ₦${finalWallet?.balance?.toLocaleString() || 0}`);
    console.log(`   ✅ Match: ${finalOrders.reduce((sum, o) => sum + (o.vendorAmount || 0), 0) === finalWallet?.balance}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

recreateTopVendorEarnings();
