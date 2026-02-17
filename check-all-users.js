// check-all-users.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAllUsers() {
  console.log('👥 Checking all users in database...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`👤 User: ${user.name || user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'Not set'}`);
      console.log(`   Type: ${user.userType || user.accountType || 'Unknown'}`);
      console.log('   ---');
    });
    
    // Check which users have wallets
    const wallets = await db.collection('wallets').find({}).toArray();
    
    console.log(`\n💰 Total wallets: ${wallets.length}`);
    
    wallets.forEach(wallet => {
      console.log(`💳 Wallet for user: ${wallet.userId}`);
      console.log(`   Role: ${wallet.role}`);
      console.log(`   Balance: ₦${wallet.balance}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkAllUsers();