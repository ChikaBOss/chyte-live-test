// find-my-data.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function findData() {
  console.log('🔍 Searching for your data in all databases...\n');
  
  // Use your connection string WITHOUT database name
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('📚 Available databases:');
    
    // Check each database for your collections
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      console.log(`\n📂 Checking database: ${dbName}`);
      
      // Skip system databases
      if (dbName === 'admin' || dbName === 'local') {
        console.log('   ⏭️  Skipping system database');
        continue;
      }
      
      const database = client.db(dbName);
      const collections = await database.listCollections().toArray();
      
      if (collections.length === 0) {
        console.log('   📭 No collections');
        continue;
      }
      
      // Check for your specific collections
      const collectionNames = collections.map(c => c.name);
      const hasOrders = collectionNames.includes('orders');
      const hasChildOrders = collectionNames.includes('childorders');
      const hasWallets = collectionNames.includes('wallets');
      
      console.log(`   📁 Collections: ${collectionNames.join(', ')}`);
      
      if (hasOrders || hasChildOrders || hasWallets) {
        console.log('   🎯 FOUND YOUR DATA!');
        
        // Count documents
        if (hasOrders) {
          const count = await database.collection('orders').countDocuments();
          console.log(`      orders: ${count} documents`);
        }
        if (hasChildOrders) {
          const count = await database.collection('childorders').countDocuments();
          console.log(`      childorders: ${count} documents`);
        }
        if (hasWallets) {
          const count = await database.collection('wallets').countDocuments();
          console.log(`      wallets: ${count} documents`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

findData();