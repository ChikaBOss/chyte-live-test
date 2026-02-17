// test-after-vendorRole-fix.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testAfterFix() {
  console.log('🧪 Testing after vendorRole fix...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    const testUserId = '696b7595d13d0ca193c05f75';
    
    // Check child orders with vendorRole='chef'
    const ordersChef = await db.collection('childorders').find({
      vendorId: testUserId,
      vendorRole: 'chef',
      status: 'PAID'
    }).toArray();
    
    console.log(`📦 Orders with vendorRole='chef': ${ordersChef.length}`);
    
    // Check child orders with vendorRole='vendor'
    const ordersVendor = await db.collection('childorders').find({
      vendorId: testUserId,
      vendorRole: 'vendor',
      status: 'PAID'
    }).toArray();
    
    console.log(`📦 Orders with vendorRole='vendor': ${ordersVendor.length}`);
    
    // Check child orders with any vendorRole
    const ordersAny = await db.collection('childorders').find({
      vendorId: testUserId,
      status: 'PAID'
    }).toArray();
    
    console.log(`📦 Total PAID orders: ${ordersAny.length}`);
    
    // Check wallet
    const wallet = await db.collection('wallets').findOne({
      userId: testUserId
    });
    
    console.log(`\n💰 Wallet balance: ₦${wallet?.balance?.toLocaleString() || 0}`);
    console.log(`   Wallet role: ${wallet?.role}`);
    
    // Show sample order details
    if (ordersAny.length > 0) {
      console.log('\n📝 Sample order:');
      const sample = ordersAny[0];
      console.log({
        _id: sample._id,
        vendorRole: sample.vendorRole,
        vendorAmount: sample.vendorAmount,
        subtotal: sample.subtotal,
        status: sample.status
      });
    }
    
    // Test what earnings API would return with role='chef'
    console.log('\n🔍 Earnings API query with role="chef":');
    const earningsWithChef = await db.collection('childorders').find({
      vendorId: testUserId,
      vendorRole: 'chef',
      status: 'PAID'
    }).toArray();
    
    console.log(`   Found: ${earningsWithChef.length} orders`);
    
    // Test what earnings API would return with role='vendor'
    console.log('🔍 Earnings API query with role="vendor":');
    const earningsWithVendor = await db.collection('childorders').find({
      vendorId: testUserId,
      vendorRole: 'vendor',
      status: 'PAID'
    }).toArray();
    
    console.log(`   Found: ${earningsWithVendor.length} orders`);
    
    if (earningsWithVendor.length > 0) {
      console.log('\n✅ SUCCESS! Earnings API will now return data!');
      console.log('✨ Restart your app and check dashboard!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testAfterFix();