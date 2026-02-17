// check-collections.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkCollections() {
  console.log('📚 Checking all collections...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    const collections = await db.listCollections().toArray();
    
    console.log('📂 All collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check each vendor collection
    const vendorCollections = ['chefs', 'pharmacies', 'topvendors', 'vendors'];
    
    console.log('\n👥 Checking vendor collections:');
    for (const colName of vendorCollections) {
      const count = await db.collection(colName).countDocuments();
      console.log(`  ${colName}: ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection(colName).findOne({});
        console.log(`    Sample: ${JSON.stringify({
          _id: sample._id,
          email: sample.email,
          name: sample.name || sample.businessName,
          role: sample.role || colName.slice(0, -1)
        }, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkCollections();