// test-vendor-earnings.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testVendorEarnings() {
  console.log('🧪 Testing vendor earnings after status fix...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    
    // Test with one of your vendors (using the chef from earlier logs)
    const testUserId = '696b7595d13d0ca193c05f75'; // Chef vendor
    const testRole = 'chef'; // From session logs
    
    console.log(`Testing vendor: ${testUserId} (${testRole})`);
    
    // 1. Check wallet
    const wallet = await db.collection('wallets').findOne({
      userId: testUserId,
      role: 'vendor' // Note: Wallets were created with role 'vendor', not 'chef'
    });
    
    console.log(`\n💰 Wallet found: ${!!wallet}`);
    if (wallet) {
      console.log(`   Balance: ₦${wallet.balance?.toLocaleString() || 0}`);
      console.log(`   Role in wallet: ${wallet.role}`);
    }
    
    // 2. Check child orders with vendorRole 'chef'
    const childOrdersChef = await db.collection('childorders').find({
      vendorId: testUserId,
      vendorRole: 'chef', // Looking for chef role
      status: 'PAID'
    }).toArray();
    
    console.log(`\n📦 Child orders with vendorRole='chef': ${childOrdersChef.length}`);
    
    // 3. Check child orders with any role for this vendor
    const childOrdersAnyRole = await db.collection('childorders').find({
      vendorId: testUserId,
      status: 'PAID'
    }).toArray();
    
    console.log(`📦 Child orders with any role: ${childOrdersAnyRole.length}`);
    
    if (childOrdersAnyRole.length > 0) {
      console.log('\n📝 Sample child order:');
      console.log({
        vendorId: childOrdersAnyRole[0].vendorId,
        vendorRole: childOrdersAnyRole[0].vendorRole,
        status: childOrdersAnyRole[0].status,
        vendorAmount: childOrdersAnyRole[0].vendorAmount,
        subtotal: childOrdersAnyRole[0].subtotal
      });
      
      // Calculate total vendor amount
      const totalVendorAmount = childOrdersAnyRole.reduce((sum, order) => {
        return sum + (order.vendorAmount || 0);
      }, 0);
      
      console.log(`\n🧮 Total vendorAmount from orders: ₦${totalVendorAmount.toLocaleString()}`);
    }
    
    // 4. Check what the earnings API would return
    console.log('\n🔍 What earnings API should return:');
    
    // Query with $or for vendorRole
    const earningsQuery = {
      vendorId: testUserId,
      $or: [
        { vendorRole: 'chef' },
        { vendorRole: 'vendor' } // Try both
      ],
      status: 'PAID'
    };
    
    const earningsOrders = await db.collection('childorders').find(earningsQuery).toArray();
    const totalEarnings = earningsOrders.reduce((sum, order) => sum + (order.vendorAmount || 0), 0);
    
    console.log(`   Found ${earningsOrders.length} orders`);
    console.log(`   Total earnings: ₦${totalEarnings.toLocaleString()}`);
    
    if (wallet) {
      console.log(`\n✅ Wallet balance (₦${wallet.balance?.toLocaleString()}) should match or be close to total earnings`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testVendorEarnings();