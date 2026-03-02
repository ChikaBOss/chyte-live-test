// scripts/migrate-delivery-pricing-direct.js
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(); // uses database from URI
    const ridersCollection = db.collection('riders');
    const pricingCollection = db.collection('deliverypricings'); // adjust collection name if needed

    // 1. Find or create default rider
    let defaultRider = await ridersCollection.findOne({ email: 'default@chyte.com' });
    if (!defaultRider) {
      const result = await ridersCollection.insertOne({
        name: 'Chyte Logistics',
        email: 'default@chyte.com',
        password: 'dummy-password-hash',
        phone: '08000000000',
        address: 'Default address',
        approved: true,
        status: 'approved',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      defaultRider = await ridersCollection.findOne({ _id: result.insertedId });
      console.log('✅ Created default rider:', defaultRider.name);
    } else {
      console.log('ℹ️ Default rider already exists');
    }

    // 2. Update pricing records without companyId
    const updateResult = await pricingCollection.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultRider._id } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} pricing records`);

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.close();
    console.log('Migration complete');
  }
}

migrate();