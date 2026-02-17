// fix-topvendor-orders.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixTopVendorOrders() {
  console.log('⭐ Fixing top vendor orders...\n');
  
  const uri = "mongodb+srv://chyteit_db_user:Passion120@chytecluster.dtvisfs.mongodb.net/test?retryWrites=true&w=majority&appName=ChyteCluster";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('test');
    
    // Delete existing top vendor child orders
    await db.collection('childorders').deleteMany({
      vendorId: '696b753cd13d0ca193c05f6f',
      vendorRole: 'topvendor'
    });
    
    // Find parent orders with top vendor items
    const parentOrders = await db.collection('orders').find({
      'vendorGroups.vendorId': '696b753cd13d0ca193c05f6f'
    }).toArray();
    
    console.log(`📦 Found ${parentOrders.length} parent orders with top vendor items`);
    
    let totalVendorAmount = 0;
    
    for (const order of parentOrders) {
      const vendorGroup = order.vendorGroups.find(v => v.vendorId === '696b753cd13d0ca193c05f6f');
      
      if (vendorGroup) {
        const subtotal = vendorGroup.subtotal;
        const commissionRate = 0.08; // 8% for top vendor
        const commissionAmount = subtotal * commissionRate;
        const vendorAmount = subtotal - commissionAmount;
        
        await db.collection('childorders').insertOne({
          parentOrderId: order._id,
          vendorId: '696b753cd13d0ca193c05f6f',
          vendorName: vendorGroup.vendorName || 'Top Vendor',
          vendorRole: 'topvendor',
          items: vendorGroup.items || [],
          subtotal: subtotal,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          vendorAmount: vendorAmount,
          status: 'PAID',
          paidAt: order.paidAt || order.createdAt || new Date(),
          createdAt: order.createdAt || new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ Created child order: ₦${subtotal} → You get ₦${vendorAmount}`);
        totalVendorAmount += vendorAmount;
      }
    }
    
    // Update wallet
    await db.collection('wallets').updateOne(
      { userId: '696b753cd13d0ca193c05f6f', role: 'topvendor' },
      { 
        $set: { 
          balance: totalVendorAmount,
          totalEarned: totalVendorAmount,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`\n💰 Updated top vendor wallet to ₦${totalVendorAmount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixTopVendorOrders();