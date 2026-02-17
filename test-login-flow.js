// test-login-flow.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testLoginFlow() {
  console.log('🔍 Testing login flow for each role...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    
    // Test each role
    const testCases = [
      { role: 'chef', expectedId: '696b7595d13d0ca193c05f75' },
      { role: 'pharmacy', expectedId: '696b7604d13d0ca193c05f7f' },
      { role: 'topvendor', expectedId: '696b753cd13d0ca193c05f6f' }
    ];
    
    for (const test of testCases) {
      console.log(`\n🧪 Testing ${test.role}:`);
      
      // Check collection
      const collectionName = test.role === 'topvendor' ? 'topvendors' : test.role + 's';
      const user = await db.collection(collectionName).findOne({
        email: 'chikafavourchisom@gmail.com'
      });
      
      console.log(`   Found in ${collectionName}:`, user?._id);
      console.log(`   Expected: ${test.expectedId}`);
      console.log(`   Match: ${user?._id.toString() === test.expectedId}`);
      
      // Check wallet
      const wallet = await db.collection('wallets').findOne({
        userId: test.expectedId,
        role: test.role
      });
      
      console.log(`   Wallet balance: ₦${wallet?.balance || 0}`);
      console.log(`   Wallet role: ${wallet?.role}`);
    }
    
    // Check which wallet has 330,480 balance
    console.log('\n💰 Which wallet has ₦330,480?');
    const richWallet = await db.collection('wallets').findOne({
      balance: 330480
    });
    
    if (richWallet) {
      console.log(`   User ID: ${richWallet.userId}`);
      console.log(`   Role: ${richWallet.role}`);
      
      // Find which collection this user is in
      const collections = ['chefs', 'pharmacies', 'topvendors'];
      for (const col of collections) {
        const user = await db.collection(col).findOne({
          _id: richWallet.userId
        });
        if (user) {
          console.log(`   Found in: ${col}`);
          console.log(`   Email: ${user.email}`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testLoginFlow();