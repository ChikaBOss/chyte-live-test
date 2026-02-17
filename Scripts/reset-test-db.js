// scripts/reset-test-db.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function resetTestDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to test database');

    const db = mongoose.connection.db;
    const collections = ['orders', 'childorders', 'wallets', 'transactions'];

    for (const name of collections) {
      try {
        await db.collection(name).drop();
        console.log(`🗑️ Dropped collection: ${name}`);
      } catch (err) {
        if (err.code === 26) console.log(`⚠️ Collection ${name} did not exist`);
        else throw err;
      }
    }

    console.log('✅ Test database reset complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetTestDB();