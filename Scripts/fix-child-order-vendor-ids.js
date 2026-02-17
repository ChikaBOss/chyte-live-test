// scripts/fix-child-order-vendor-ids.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixChildOrders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const childOrders = await mongoose.connection.collection('childorders').find({}).toArray();
    console.log(`📦 Found ${childOrders.length} child orders`);

    let fixed = 0;
    let skipped = 0;

    for (const order of childOrders) {
      if (typeof order.vendorId === 'string' && order.vendorId.includes('@')) {
        const email = order.vendorId;
        let role = order.vendorRole || 'vendor';
        const collectionName = `${role}s`; // e.g., "chefs", "pharmacies", "topvendors", "vendors"

        const vendor = await mongoose.connection.collection(collectionName).findOne({ email });
        if (vendor) {
          await mongoose.connection.collection('childorders').updateOne(
            { _id: order._id },
            { $set: { vendorId: vendor._id.toString(), vendorRole: role } }
          );
          console.log(`✅ Fixed order ${order._id} -> ${vendor._id} (${role})`);
          fixed++;
        } else {
          console.log(`⚠️ No ${role} found for email ${email} – order ${order._id}`);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Fixed: ${fixed} orders`);
    console.log(`   Skipped: ${skipped} orders`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

fixChildOrders();