// scripts/fix-wallet-user-ids.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixWallets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const wallets = await mongoose.connection.collection('wallets').find({}).toArray();
    console.log(`📦 Found ${wallets.length} wallets`);

    let fixed = 0;
    let skipped = 0;

    for (const wallet of wallets) {
      // Skip platform wallet
      if (wallet.role === 'platform') {
        skipped++;
        continue;
      }

      // If userId looks like an email (contains @)
      if (typeof wallet.userId === 'string' && wallet.userId.includes('@')) {
        const email = wallet.userId;
        const role = wallet.role;

        // Find the actual vendor document
        const collectionName = `${role}s`; // e.g., "chefs", "pharmacies", "topvendors", "vendors"
        const vendor = await mongoose.connection.collection(collectionName).findOne({ email });

        if (vendor) {
          // Update wallet to use vendor._id as userId
          await mongoose.connection.collection('wallets').updateOne(
            { _id: wallet._id },
            { $set: { userId: vendor._id.toString() } }
          );
          console.log(`✅ Fixed wallet ${wallet._id} -> ${vendor._id} (${role})`);
          fixed++;
        } else {
          console.log(`⚠️ No ${role} found for email ${email} – wallet ${wallet._id}`);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Fixed: ${fixed} wallets`);
    console.log(`   Skipped: ${skipped} wallets`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

fixWallets();