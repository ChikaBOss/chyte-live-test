// debug-data-types.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function debugDataTypes() {
  console.log('🔍 Debugging data types...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');
  
  // Get a sample child order
  const ChildOrder = mongoose.connection.collection('childorders');
  const sampleOrder = await ChildOrder.findOne({});
  
  console.log('📦 SAMPLE CHILD ORDER:');
  console.log(JSON.stringify(sampleOrder, null, 2));
  console.log('\n📊 VendorId type:', typeof sampleOrder?.vendorId);
  console.log('📊 VendorId constructor:', sampleOrder?.vendorId?.constructor?.name);
  
  // Get a sample wallet
  const Wallet = mongoose.connection.collection('wallets');
  const sampleWallet = await Wallet.findOne({ role: 'vendor' });
  
  console.log('\n💰 SAMPLE WALLET:');
  console.log(JSON.stringify(sampleWallet, null, 2));
  console.log('\n📊 UserId type:', typeof sampleWallet?.userId);
  console.log('📊 UserId constructor:', sampleWallet?.userId?.constructor?.name);
  
  // Check a specific user's child orders
  const testUserId = '696e5260b9657096798e4f84';
  const childOrdersCount = await ChildOrder.countDocuments({
    $or: [
      { vendorId: testUserId },
      { vendorId: new mongoose.Types.ObjectId(testUserId) }
    ]
  });
  
  console.log(`\n🎯 Child orders for user ${testUserId}: ${childOrdersCount}`);
  
  mongoose.disconnect();
}

debugDataTypes();