// fix-childorder-status.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixChildOrderStatus() {
  console.log('🔄 Updating child orders to PAID status...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('test');
    const childOrdersCollection = db.collection('childorders');
    
    // Count by status
    const pendingCount = await childOrdersCollection.countDocuments({ status: 'PENDING' });
    const paidCount = await childOrdersCollection.countDocuments({ status: 'PAID' });
    
    console.log(`📊 Status counts:`);
    console.log(`   PENDING: ${pendingCount}`);
    console.log(`   PAID: ${paidCount}`);
    
    if (pendingCount === 0) {
      console.log('✅ All child orders are already PAID');
    } else {
      console.log(`\n🔄 Updating ${pendingCount} child orders to PAID...`);
      
      // First, get all pending orders to calculate vendorAmount
      const pendingOrders = await childOrdersCollection.find({ status: 'PENDING' }).toArray();
      
      let updatedCount = 0;
      
      for (const order of pendingOrders) {
        try {
          // Calculate vendor amount (10% commission)
          const commissionRate = 0.1; // 10%
          const commissionAmount = order.subtotal * commissionRate;
          const vendorAmount = order.subtotal - commissionAmount;
          
          // Update the order
          await childOrdersCollection.updateOne(
            { _id: order._id },
            { 
              $set: { 
                status: 'PAID',
                paidAt: new Date(),
                vendorAmount: vendorAmount,
                commissionAmount: commissionAmount,
                commissionRate: commissionRate
              }
            }
          );
          
          updatedCount++;
          
          if (updatedCount % 10 === 0) {
            console.log(`   Updated ${updatedCount}/${pendingCount} orders...`);
          }
        } catch (error) {
          console.log(`   Error updating order ${order._id}:`, error.message);
        }
      }
      
      console.log(`\n✅ Updated ${updatedCount} child orders to PAID`);
      
      // Also update the parent orders to PAID
      const ordersCollection = db.collection('orders');
      
      // Get unique parent order IDs from the child orders we updated
      const parentOrderIds = [...new Set(pendingOrders.map(order => order.parentOrderId))];
      
      if (parentOrderIds.length > 0) {
        const parentUpdateResult = await ordersCollection.updateMany(
          { _id: { $in: parentOrderIds } },
          { $set: { status: 'PAID', paidAt: new Date() } }
        );
        console.log(`✅ Updated ${parentUpdateResult.modifiedCount} parent orders to PAID`);
      }
    }
    
    // Show final counts
    const finalPending = await childOrdersCollection.countDocuments({ status: 'PENDING' });
    const finalPaid = await childOrdersCollection.countDocuments({ status: 'PAID' });
    
    console.log(`\n📊 Final status counts:`);
    console.log(`   PENDING: ${finalPending}`);
    console.log(`   PAID: ${finalPaid}`);
    
    // Also check if vendorAmount is set
    const withoutVendorAmount = await childOrdersCollection.countDocuments({ 
      status: 'PAID',
      vendorAmount: { $exists: false }
    });
    
    const withVendorAmount = await childOrdersCollection.countDocuments({ 
      status: 'PAID',
      vendorAmount: { $exists: true }
    });
    
    console.log(`\n💰 Vendor Amount Status:`);
    console.log(`   With vendorAmount: ${withVendorAmount}`);
    console.log(`   Without vendorAmount: ${withoutVendorAmount}`);
    
    console.log('\n🎉 Status fix complete!');
    console.log('✨ Restart your Next.js app and check vendor dashboards!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixChildOrderStatus();