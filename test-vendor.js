// test-vendor.js
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";

async function testVendor() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('test');
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get all wallets
    const wallets = await db.collection('wallets').find({}).toArray();
    
    console.log('💰 WALLETS CREATED:');
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. Vendor: ${wallet.userId.slice(0, 8)}...`);
      console.log(`   Role: ${wallet.role}`);
      console.log(`   Balance: ₦${wallet.balance.toLocaleString()}`);
      console.log(`   Total Earned: ₦${wallet.totalEarned.toLocaleString()}`);
      console.log('   ---');
    });
    
    console.log(`\n📊 Total wallets: ${wallets.length}`);
    console.log('🎉 Vendors should now see earnings in their dashboards!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testVendor();