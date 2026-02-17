// test-mongo.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('URI (without password):', process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected!');
    
    // List databases
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('\n📊 Available databases:');
    dbs.databases.forEach(db => console.log(`   - ${db.name}`));
    
    // Check your collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections in "chyte" database:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Count documents
    const orders = await mongoose.connection.db.collection('orders').countDocuments();
    const childorders = await mongoose.connection.db.collection('childorders').countDocuments();
    const wallets = await mongoose.connection.db.collection('wallets').countDocuments();
    
    console.log('\n📈 Document Counts:');
    console.log(`   Orders: ${orders}`);
    console.log(`   Child Orders: ${childorders}`);
    console.log(`   Wallets: ${wallets}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();