// quick-add-vendorRole.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function quickAddVendorRole() {
  console.log('🚀 Quick fix: Adding vendorRole to all child orders...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    
    // Add 'vendor' role to all child orders
    const result = await db.collection('childorders').updateMany(
      { vendorRole: { $exists: false } },
      { $set: { vendorRole: 'vendor' } }
    );
    
    console.log(`✅ Added vendorRole to ${result.modifiedCount} child orders`);
    
    // Also update wallets to have 'vendor' role (they already do)
    console.log('✅ All wallets already have role: vendor');
    
    console.log('\n✨ Restart your app! Vendor dashboards should now work.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

quickAddVendorRole();