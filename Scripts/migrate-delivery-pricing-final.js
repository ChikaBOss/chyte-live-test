// scripts/migrate-delivery-pricing-final.js 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Import models (adjust path if your models are elsewhere, e.g., '../src/models')
const DeliveryPricing = require('../models/DeliveryPricing');
const Rider = require('../models/Rider');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find or create a default rider
    let defaultRider = await Rider.findOne({ email: 'default@chyte.com' });
    if (!defaultRider) {
      defaultRider = await Rider.create({
        name: 'Chyte Logistics',
        email: 'default@chyte.com',
        password: 'dummy-password-hash',
        phone: '08000000000',
        address: 'Default address',
        approved: true,
        status: 'approved',
        isActive: true,
      });
      console.log('✅ Created default rider:', defaultRider.name);
    } else {
      console.log('ℹ️ Default rider already exists');
    }

    // 2. Update all pricing records to include companyId
    const result = await DeliveryPricing.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultRider._id } }
    );
    console.log(`✅ Updated ${result.modifiedCount} pricing records`);

    await mongoose.disconnect();
    console.log('Migration complete');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();