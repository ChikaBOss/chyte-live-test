// fix-childorder-vendorRole.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixChildOrderVendorRole() {
  console.log('🔄 Adding vendorRole to child orders...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('test');
    const childOrdersCollection = db.collection('childorders');
    
    // Get all child orders without vendorRole
    const childOrders = await childOrdersCollection.find({
      vendorRole: { $exists: false }
    }).toArray();
    
    console.log(`📦 Found ${childOrders.length} child orders without vendorRole`);
    
    // Check parent orders to see vendor groups
    const ordersCollection = db.collection('orders');
    
    let updated = 0;
    
    for (const childOrder of childOrders) {
      try {
        // Try to find parent order to get vendorRole
        const parentOrder = await ordersCollection.findOne({
          _id: childOrder.parentOrderId
        });
        
        if (parentOrder && parentOrder.vendorGroups) {
          // Find this vendor in vendorGroups
          const vendorGroup = parentOrder.vendorGroups.find(
            vg => vg.vendorId === childOrder.vendorId
          );
          
          if (vendorGroup) {
            // Update child order with vendorRole from vendorGroup
            await childOrdersCollection.updateOne(
              { _id: childOrder._id },
              { $set: { vendorRole: vendorGroup.vendorRole || 'vendor' } }
            );
            updated++;
            console.log(`✅ Updated ${childOrder._id} with role: ${vendorGroup.vendorRole || 'vendor'}`);
          } else {
            // Set default 'vendor' role
            await childOrdersCollection.updateOne(
              { _id: childOrder._id },
              { $set: { vendorRole: 'vendor' } }
            );
            updated++;
            console.log(`⚠️ Set default 'vendor' role for ${childOrder._id}`);
          }
        } else {
          // Set default 'vendor' role
          await childOrdersCollection.updateOne(
            { _id: childOrder._id },
            { $set: { vendorRole: 'vendor' } }
          );
          updated++;
          console.log(`⚠️ Set default 'vendor' role for ${childOrder._id} (no parent found)`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${childOrder._id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Updated ${updated} child orders with vendorRole`);
    
    // Verify
    const withoutRole = await childOrdersCollection.countDocuments({
      vendorRole: { $exists: false }
    });
    
    const withRole = await childOrdersCollection.countDocuments({
      vendorRole: { $exists: true }
    });
    
    console.log(`\n📊 Final counts:`);
    console.log(`   Without vendorRole: ${withoutRole}`);
    console.log(`   With vendorRole: ${withRole}`);
    
    // Also update wallet roles to match
    console.log('\n🔄 Updating wallet roles to match child orders...');
    
    // Get all child orders grouped by vendorId to find their role
    const allChildOrders = await childOrdersCollection.find({}).toArray();
    const vendorRoleMap = {};
    
    allChildOrders.forEach(order => {
      if (order.vendorId && order.vendorRole) {
        vendorRoleMap[order.vendorId] = order.vendorRole;
      }
    });
    
    // Update wallets
    const walletsCollection = db.collection('wallets');
    let walletsUpdated = 0;
    
    for (const [vendorId, vendorRole] of Object.entries(vendorRoleMap)) {
      const result = await walletsCollection.updateOne(
        { userId: vendorId },
        { $set: { role: vendorRole } }
      );
      
      if (result.modifiedCount > 0) {
        walletsUpdated++;
        console.log(`✅ Updated wallet for ${vendorId} to role: ${vendorRole}`);
      }
    }
    
    console.log(`\n🎉 Updated ${walletsUpdated} wallet roles`);
    console.log('✨ Restart your app and check dashboards!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixChildOrderVendorRole();