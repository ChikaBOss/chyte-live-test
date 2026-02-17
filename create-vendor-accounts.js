// create-vendor-accounts.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createVendorAccounts() {
  console.log('👥 Creating separate vendor accounts...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('test');
    const usersCollection = db.collection('users');
    
    // Original user (currently a chef)
    const originalUser = await usersCollection.findOne({
      email: 'chikafavourchisom@gmail.com'
    });
    
    if (!originalUser) {
      console.log('❌ Original user not found');
      return;
    }
    
    console.log(`👤 Original user: ${originalUser.email} (${originalUser.role || 'No role'})`);
    
    // Create pharmacy user
    const pharmacyUser = {
      name: 'Pharmacy Vendor',
      email: 'pharmacy.chikafavour@gmail.com',
      password: originalUser.password, // Same password for testing
      role: 'pharmacy',
      userType: 'vendor',
      approved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: originalUser.phone || '08144595885',
      address: originalUser.address || 'Owerri'
    };
    
    // Create topvendor user
    const topVendorUser = {
      name: 'Top Vendor',
      email: 'topvendor.chikafavour@gmail.com',
      password: originalUser.password,
      role: 'topvendor',
      userType: 'vendor',
      approved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: originalUser.phone || '08144595885',
      address: originalUser.address || 'Owerri'
    };
    
    // Check if they exist
    const existingPharmacy = await usersCollection.findOne({ 
      email: pharmacyUser.email 
    });
    
    const existingTopVendor = await usersCollection.findOne({ 
      email: topVendorUser.email 
    });
    
    // Create if they don't exist
    let pharmacyUserId = existingPharmacy?._id;
    let topVendorUserId = existingTopVendor?._id;
    
    if (!existingPharmacy) {
      const result = await usersCollection.insertOne(pharmacyUser);
      pharmacyUserId = result.insertedId;
      console.log(`✅ Created pharmacy user: ${pharmacyUser.email}`);
    } else {
      console.log(`⚠️ Pharmacy user already exists: ${pharmacyUser.email}`);
    }
    
    if (!existingTopVendor) {
      const result = await usersCollection.insertOne(topVendorUser);
      topVendorUserId = result.insertedId;
      console.log(`✅ Created top vendor user: ${topVendorUser.email}`);
    } else {
      console.log(`⚠️ Top vendor user already exists: ${topVendorUser.email}`);
    }
    
    // Create wallets for these users
    const walletsCollection = db.collection('wallets');
    
    // Create pharmacy wallet with 0 balance
    const pharmacyWallet = await walletsCollection.findOne({
      userId: pharmacyUserId.toString(),
      role: 'pharmacy'
    });
    
    if (!pharmacyWallet) {
      await walletsCollection.insertOne({
        userId: pharmacyUserId.toString(),
        role: 'pharmacy',
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        currency: 'NGN',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created pharmacy wallet with 0 balance');
    }
    
    // Create topvendor wallet with 0 balance
    const topVendorWallet = await walletsCollection.findOne({
      userId: topVendorUserId.toString(),
      role: 'topvendor'
    });
    
    if (!topVendorWallet) {
      await walletsCollection.insertOne({
        userId: topVendorUserId.toString(),
        role: 'topvendor',
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        currency: 'NGN',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created top vendor wallet with 0 balance');
    }
    
    // Update original user to have correct role
    await usersCollection.updateOne(
      { _id: originalUser._id },
      { $set: { role: 'chef', userType: 'chef' } }
    );
    console.log(`✅ Updated original user role to 'chef'`);
    
    console.log('\n🎉 Vendor accounts created!');
    console.log('\n📧 Login Credentials:');
    console.log('   Chef: chikafavourchisom@gmail.com (₦330,480 balance)');
    console.log('   Pharmacy: pharmacy.chikafavour@gmail.com (₦0 balance)');
    console.log('   Top Vendor: topvendor.chikafavour@gmail.com (₦0 balance)');
    console.log('\n🔑 Password: Same as your current password');
    console.log('✨ Now log in with different emails for each vendor type!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

createVendorAccounts();