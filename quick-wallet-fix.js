// quick-wallet-fix.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixWallets() {
  console.log('🚀 Creating wallets from existing orders...');
  
  try {
    // Use your exact URI from .env.local
    const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/chyte?retryWrites=true&w=majority&appName=ChyteCluster";
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all child orders
    const childOrders = await db.collection('childorders').find().toArray();
    console.log(`Found ${childOrders.length} child orders`);
    
    // Group by vendor
    const vendorTotals = {};
    
    childOrders.forEach(order => {
      const vendorId = order.vendorId;
      const role = order.vendorRole || 'vendor';
      const subtotal = order.subtotal || 0;
      
      // Simple 10% commission for all
      const vendorAmount = subtotal * 0.9;
      
      const key = `${vendorId}-${role}`;
      
      if (!vendorTotals[key]) {
        vendorTotals[key] = {
          vendorId: vendorId,
          role: role,
          total: vendorAmount,
          orders: 1
        };
      } else {
        vendorTotals[key].total += vendorAmount;
        vendorTotals[key].orders += 1;
      }
    });
    
    console.log(`\nFound ${Object.keys(vendorTotals).length} unique vendor-role combinations`);
    
    // Create wallets
    const wallets = db.collection('wallets');
    let created = 0;
    
    for (const key in vendorTotals) {
      const vendor = vendorTotals[key];
      
      try {
        // Check if wallet exists
        const existing = await wallets.findOne({
          userId: vendor.vendorId,
          role: vendor.role
        });
        
        if (!existing) {
          await wallets.insertOne({
            userId: vendor.vendorId,
            role: vendor.role,
            balance: vendor.total,
            pendingBalance: 0,
            totalEarned: vendor.total,
            totalWithdrawn: 0,
            currency: 'NGN',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          created++;
          console.log(`✅ Created wallet for ${vendor.vendorId} (${vendor.role}): ₦${vendor.total}`);
        } else {
          console.log(`⚠️ Wallet already exists for ${vendor.vendorId} (${vendor.role})`);
        }
      } catch (err) {
        console.log(`❌ Error creating wallet for ${key}:`, err.message);
      }
    }
    
    console.log(`\n🎉 Created ${created} new wallets!`);
    console.log('✨ Check your vendor dashboards now!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixWallets();// quick-wallet-fix.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixWallets() {
  console.log('🚀 Creating wallets from existing orders...');
  
  try {
    // Use your exact URI from .env.local
    const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/chyte?retryWrites=true&w=majority&appName=ChyteCluster";
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all child orders
    const childOrders = await db.collection('childorders').find().toArray();
    console.log(`Found ${childOrders.length} child orders`);
    
    // Group by vendor
    const vendorTotals = {};
    
    childOrders.forEach(order => {
      const vendorId = order.vendorId;
      const role = order.vendorRole || 'vendor';
      const subtotal = order.subtotal || 0;
      
      // Simple 10% commission for all
      const vendorAmount = subtotal * 0.9;
      
      const key = `${vendorId}-${role}`;
      
      if (!vendorTotals[key]) {
        vendorTotals[key] = {
          vendorId: vendorId,
          role: role,
          total: vendorAmount,
          orders: 1
        };
      } else {
        vendorTotals[key].total += vendorAmount;
        vendorTotals[key].orders += 1;
      }
    });
    
    console.log(`\nFound ${Object.keys(vendorTotals).length} unique vendor-role combinations`);
    
    // Create wallets
    const wallets = db.collection('wallets');
    let created = 0;
    
    for (const key in vendorTotals) {
      const vendor = vendorTotals[key];
      
      try {
        // Check if wallet exists
        const existing = await wallets.findOne({
          userId: vendor.vendorId,
          role: vendor.role
        });
        
        if (!existing) {
          await wallets.insertOne({
            userId: vendor.vendorId,
            role: vendor.role,
            balance: vendor.total,
            pendingBalance: 0,
            totalEarned: vendor.total,
            totalWithdrawn: 0,
            currency: 'NGN',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          created++;
          console.log(`✅ Created wallet for ${vendor.vendorId} (${vendor.role}): ₦${vendor.total}`);
        } else {
          console.log(`⚠️ Wallet already exists for ${vendor.vendorId} (${vendor.role})`);
        }
      } catch (err) {
        console.log(`❌ Error creating wallet for ${key}:`, err.message);
      }
    }
    
    console.log(`\n🎉 Created ${created} new wallets!`);
    console.log('✨ Check your vendor dashboards now!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixWallets();