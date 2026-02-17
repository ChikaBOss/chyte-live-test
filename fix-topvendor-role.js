// fix-topvendor-role.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixTopVendorRole() {
  console.log('🔄 Fixing top vendor role...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    
    // Update top vendor role
    await db.collection('topvendors').updateOne(
      { email: 'chikafavourchisom@gmail.com' },
      { $set: { role: 'topvendor' } } // Change from 'top-vendor' to 'topvendor'
    );
    
    console.log('✅ Updated top vendor role to "topvendor"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixTopVendorRole();