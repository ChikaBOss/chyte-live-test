// test-topvendor-auth.js
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testTopVendorAuth() {
  console.log('🔍 TESTING TOP VENDOR AUTHENTICATION\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('test');
    const TOP_VENDOR_ID = '696b753cd13d0ca193c05f6f';
    
    // 1. Check if user exists
    const user = await db.collection('topvendors').findOne({
      _id: new ObjectId(TOP_VENDOR_ID)
    });
    
    console.log('📋 TOP VENDOR RECORD:');
    console.log('   ID:', user?._id);
    console.log('   Email:', user?.email);
    console.log('   Role:', user?.role);
    console.log('   Approved:', user?.approved);
    console.log('   Has Password:', !!user?.password);
    console.log('   Password length:', user?.password?.length);
    
    if (!user) {
      console.log('❌ ERROR: User not found!');
      return;
    }
    
    // 2. Test password comparison
    const testPassword = 'password123';
    console.log('\n🔑 Testing password:', testPassword);
    
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('   Password match:', isMatch);
    } catch (err) {
      console.log('   ❌ Password comparison error:', err.message);
    }
    
    // 3. If password doesn't match, reset it
    if (!isMatch) {
      console.log('\n⚠️ Password mismatch! Resetting to "password123"...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.collection('topvendors').updateOne(
        { _id: new ObjectId(TOP_VENDOR_ID) },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Password reset complete');
    }
    
    // 4. Check wallet
    const wallet = await db.collection('wallets').findOne({
      userId: TOP_VENDOR_ID
    });
    
    console.log('\n💰 WALLET:');
    console.log('   Role:', wallet?.role);
    console.log('   Balance:', wallet?.balance);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testTopVendorAuth();